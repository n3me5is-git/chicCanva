# Puter billing and image pricing in chicCanva

This document records the production findings and implementation rules used by chicCanva for Puter account balances and image-generation estimates. It is intended both for maintainers and for an AI agent resuming work on the project.

## Source hierarchy

The application trusts data in this order:

1. the current signed-in user's Puter payload;
2. Puter's public documentation and model-details catalog;
3. a previously validated local pricing cache;
4. the reviewed pricing table embedded in `development/puter-billing.js`.

The account balance and the image quote are separate systems. The balance is read from Puter. The quote is computed locally and never blocks editing or generation.

## Account snapshot

The account widget uses these SDK calls:

```js
const [user, monthly] = await Promise.all([
  puter.auth.getUser(),
  puter.auth.getMonthlyUsage()
]);

const appUsage = await puter.auth.getDetailedAppUsage(puter.auth.appID);
```

`user.subscribed` determines whether the account is a subscription or a free/non-subscription account. A large balance does not imply a subscription because purchased top-ups can coexist with the monthly allowance.

The fields currently used are:

| Meaning | Puter field | Treatment |
| --- | --- | --- |
| Account type | `user.subscribed` | Reported |
| Monthly allowance | `allowanceInfo.monthUsageAllowance` | Reported live; never hardcoded as an account fact |
| Purchased credits | `allowanceInfo.addons.purchasedCredits` | Reported when present, otherwise zero |
| Monthly use | `usage.allowanceUsed` | Credits consumed from the current monthly allowance |
| Purchased-credit use | `allowanceInfo.addons.consumedPurchaseCredits` | Credits consumed after the allowance was exhausted |
| Reported remaining | `allowanceInfo.remaining` | Retained for diagnostics; older/current payloads may expose only one bucket here |
| Used fallback | `usage.total` | Observed aggregate fallback |
| App-specific use | `getDetailedAppUsage(...).total` | Separate app-scoped diagnostic |

Puter spends the monthly allowance first and purchased credits second. The primary totals therefore use the two reported components rather than capping usage at the monthly allowance:

```js
monthlyRemaining = max(0, monthUsageAllowance - allowanceUsed);
purchasedRemaining = max(0, purchasedCredits - consumedPurchaseCredits);
globalRemaining = monthlyRemaining + purchasedRemaining;
globalUsed = allowanceUsed + consumedPurchaseCredits;
```

The progress bar is `globalRemaining / (monthUsageAllowance + purchasedCredits)`. This makes a fully spent free allowance and a nearly untouched top-up appear as a mostly available account rather than as an exhausted one. Both rows show total, used and residual values. If one of the component fields is unavailable, chicCanva keeps it unavailable and uses only a safe reported fallback; it never derives a negative balance.

### Units and USD

Production payloads have been observed with `allowanceInfo.unit === "credits"`, even though older API documentation described microcents. Conversion always inspects the returned unit.

```text
credits       -> USD = amount / 2,000
microcents    -> USD = amount / 100,000,000
usd-cents     -> USD = amount / 100
USD           -> unchanged
```

The observed current conversion is 2,000 Puter credits per US dollar. It is stored as configuration rather than spread through the UI. Balance credits show whole credits and USD with two decimals. Preflight estimates show whole credits and USD with three decimals.

The detailed usage object's resource `units` must not be summed as tokens. Depending on the meter, they can represent text tokens, image tokens, images, megapixels, bytes, operations, or provider-specific units.

## Pricing catalog and cache

The preferred public catalog is:

```text
https://api.puter.com/puterai/image/models/details
```

The similarly named `puter.com` route has returned an HTML application shell and is therefore rejected. chicCanva accepts the response only when it is JSON and contains a recognized positive price for at least one visible model.

The normalized cache is written to local storage under:

```text
chiccanva.puter-image-pricing.v1
```

It has a 30-day TTL. Startup behavior is:

```mermaid
flowchart TD
  A[Load embedded reviewed table] --> B{Cached table exists?}
  B -- yes --> C[Use cached table immediately]
  B -- no --> D[Use embedded table immediately]
  C --> E{Younger than 30 days?}
  E -- yes --> F[No network refresh]
  E -- no --> G[Fetch Puter catalog]
  D --> G
  G -- valid JSON and recognized prices --> H[Merge recognized fields and save]
  G -- error or unknown schema --> I[Keep stale cache or embedded table]
```

The **Aggiorna prezziario** link forces the same validation path. An invalid response never overwrites a working cached table with zeroes. **Cancella memoria** removes the pricing cache along with the other persistent app data.

## Supported price strategies

Only models visible in chicCanva are normalized:

| Model | Strategy | Live fields used |
| --- | --- | --- |
| GPT Image 2 / 2.5 Flare / 2.5 Sunburst | text, image-input and image-output token rates | `text_input`, `image_input`, `image_output` |
| Grok Imagine Standard / Quality | fixed output tier plus media input | `output:1k`, `output:2k`, `media_input` |
| Seedream 5 Lite | fixed per image | `per-image` |
| Gemini 3.1 Flash Lite Image | text/image token rates and 1K headline | `input`, `output`, `output_image`, `1K:1x1` |

Catalog values currently arrive in `usd-cents`; normalization divides them by 100. Unknown keys are ignored. Formula code remains separate from the commercial coefficients so a catalog update cannot silently change how a meter is interpreted.

## Local estimate

Each change to model, quality, output dimensions, prompt, or reference image recomputes a local quote. No billing API call occurs on each keystroke.

The quote includes:

- output cost for model, quality and dimensions;
- estimated prompt input tokens;
- an estimated reference-image component after the selected downscale factor;
- whole Puter credits and USD to three decimals;
- a confidence label.

OpenAI output dimensions and quality are independent controls. The app validates the selected width and height before quoting or generating. GPT Image 2.5 output tokens use the formula published in OpenAI's own calculator. Let `B` be the quality base (`16/24/48/64/96` for low/medium/high/xhigh/max), `S` and `L` the short and long edges, and `R = banker's-round(B / (L/S))`. The virtual grid is `B × R`, oriented like the image, and the final token estimate is `ceil(gridWidth × gridHeight × (2,000,000 + width × height) / 4,000,000)`. This explains why a larger portrait can cost less than a square: aspect ratio reduces one virtual-grid dimension before the pixel factor is applied. Flare and Sunburst use the same GPT Image 2.5 bases and published token rates.

Text input is estimated as `ceil(prompt characters / 3.7)`. It is a tokenizer-independent heuristic and is deliberately kept separate from image input. OpenAI does not publish a preflight token calculator for GPT Image 2.5 reference images. Its Vision guide explicitly states that the Vision calculator and patch/tile rules do not apply to GPT Image generation/editing inputs. chicCanva therefore labels reference cost as approximate and uses a bounded Vision-derived proxy only to obtain a plausible order of magnitude: scale the longest edge to at most 2,048 px, count 32×32 patches, cap at 2,500 patches, and apply a 1.2 multiplier before the published `$8/M` image-input rate. The selected 1×/0.75×/0.5×/0.25× reference reduction is applied first. This proxy is more defensible than the former linear megapixel guess, but it is not an OpenAI billing contract.

Grok uses xAI's fixed prices for its 1K/2K tiers. Standard costs `$0.02` at either resolution plus `$0.002` for one media input; Quality costs `$0.05` at 1K or `$0.07` at 2K plus `$0.01` per media input. Prompt length does not change xAI image-output billing. Puter's `txt2img()` adapter documents those resolution tiers but does not document an aspect-ratio argument for Grok, so chicCanva keeps its ratio selector fixed rather than claiming a control that may be ignored.

Seedream uses Puter's published `$0.035` fixed price per generation. Puter exposes no separate configuration or reference-input surcharge for this model, so chicCanva no longer invents a conservative reference premium. Gemini 3.1 Flash Lite Image is sent through its canonical Puter model ID with a `ratio` object; its supported ratios are `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, and `21:9`. This model exposes only 1K output and no separate quality tier. The 1K result is 1,120 image tokens at `$30/M`; text and image input use `$0.25/M`. Reference images use Google's documented visual tokenization: 258 tokens for small inputs, while larger images are tiled and counted at 258 tokens per tile. These are preflight estimates; the authoritative charge remains Puter's post-generation metering.

### Cross-check against observed Puter meters

The supplied Puter dashboard history confirms the unit scale and the fixed-price families:

| Meter sample | Observed | Calculation |
| --- | ---: | --- |
| Grok Standard output, 6 images | 240 Credits | `6 × $0.02 × 2,000 = 240` |
| Grok media input, 1 image | 4 Credits | `1 × $0.002 × 2,000 = 4` |
| Seedream 5 Lite, 4 images | 280 Credits | `4 × $0.035 × 2,000 = 280` |
| Gemini 1K output, 2 × 1,120 tokens | 134 Credits | `2,240 × $30/M × 2,000 = 134.4` |
| Gemini input, 155 tokens | 0.08 Credits | `155 × $0.25/M × 2,000 = 0.0775` |

These matches justify high confidence for the fixed output prices. A Gemini reference preflight still carries medium confidence because the effective image token count depends on the adapter's media-resolution handling and image normalization.

## Refresh behavior

The account widget refreshes when the user presses **Aggiorna** and shortly after a generation completes. The delay lets Puter finish recording the request. Pricing refresh has its own manual link and 30-day schedule; it is not coupled to every generation.

## Defensive and privacy rules

- Never expose or export `puter.auth.authToken`.
- Do not log user email, UUID, session data, or private URLs.
- Treat app-specific usage and total account balance as different scopes.
- Preserve unknown values as unavailable instead of coercing them to zero.
- Reject non-JSON catalog responses.
- Keep a usable stale price table after network errors.
- Keep estimation local and generation behind an explicit user click.

## Regression fixtures

The key top-up fixture is:

```json
{
  "usage": { "allowanceUsed": 1000 },
  "allowanceInfo": {
    "monthUsageAllowance": 1000,
    "addons": {
      "purchasedCredits": 20000,
      "consumedPurchaseCredits": 90.34114001228214
    },
    "unit": "credits"
  }
}
```

Expected output: 1,090 used globally, 19,910 available globally, zero monthly allowance remaining, and approximately 19,910 purchased credits remaining. The UI also states the allowance-first/top-up-second order. Reading `allowanceUsed` alone would incorrectly cap total use at 1,000; using an ambiguous `remaining` field alone can incorrectly hide purchased credit.

## Relevant implementation files

- `development/puter-billing.js` — snapshot, unit conversion, catalog adapter, cache and estimates.
- `development/puter-usage.html` — account summary UI.
- `development/ai-generation.js` — model profiles, dimensions and generation request.
- `development/ai-generation.css` — responsive account, estimate and reference controls.
- `development/build-workspace.py` — embeds the module in monolithic builds and splits the PWA build.

## Measured generation cost

The preflight quote is labelled **Stima Listino**. It uses cached Puter price coefficients, model and quality, validated output dimensions, the effective prompt, and reduced reference-image dimensions. GPT Image 2.5 output uses OpenAI's public calculator formula exactly; prompt text uses the documented local heuristic and the reference image uses the explicitly labelled Vision-derived proxy above.

Immediately before `puter.ai.txt2img()`, chicCanva reads `puter.auth.getDetailedAppUsage(puter.auth.appID)`. After an image is returned it polls the same app-scoped total briefly and stores a positive delta by model, quality, dimensions, ratio, reference presence, and reference scale. Prompt text is excluded so a recurring production profile can reuse its latest observation. When available, **Ultima Gen** becomes the primary value and **Stima Listino** remains a normal-weight secondary line directly below the estimate heading. The cache retains at most 100 profiles and the global memory-clear command removes it.

This delta is diagnostic evidence rather than a guaranteed per-request invoice: concurrent activity from the same Puter app could enter the interval. OpenAI publishes the GPT Image 2.5 output formula and token rates, but not an equivalent preflight formula for its reference-image input. The estimator therefore treats Puter's reported app-credit delta and the response's actual `usage` fields as stronger post-generation evidence.

## External research notes

- OpenAI's Image Generation guide is the authoritative source for GPT Image 2.5 text/image-input and image-output rates and for the instruction to use the response `usage` object for actual consumption: <https://developers.openai.com/api/docs/guides/image-generation>.
- OpenAI's public GPT Image calculator supplies the non-linear output formula implemented by chicCanva. The official model pages confirm the same pricing for Flare and Sunburst: <https://developers.openai.com/api/docs/models/gpt-image-2.5-flare> and <https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst>.
- OpenAI's Vision guide documents patch/tile methods but explicitly excludes GPT Image generation/editing inputs: <https://developers.openai.com/api/docs/guides/images-vision>. Those rules are used only as a visibly approximate proxy.
- A review of public GitHub calculators found vision-only tools and empirical GPT Image wrappers, but no reliable implementation of a documented GPT Image 2.5 reference-input formula. Do not silently promote an empirical table or a Vision calculator to an exact estimate.
- xAI's current pricing table documents the Standard/Quality 1K/2K output fees and per-image media input fees used above: <https://docs.x.ai/developers/pricing>.
- Puter's Seedream model card publishes a fixed `$0.035` generation price and no configurable resolution: <https://developer.puter.com/ai/byteplus/seedream-5-0-lite-260128/>.
- Google's token documentation states that small image inputs use 258 tokens and larger inputs are divided into visual tiles, each costing 258 tokens: <https://ai.google.dev/gemini-api/docs/generate-content/tokens>. Its image-generation table publishes 1K output dimensions and token counts by aspect ratio: <https://ai.google.dev/gemini-api/docs/image-generation>.

The supplied Puter dashboard sample is consistent with the published rates and the 2,000 Credits/USD conversion. A Flare `2048×2912` text-only input row with 145 units costs 1.45 Credits: `145 × $5/M × 2,000`. A reference-bearing row at the same output size reports 1,530 aggregate input units and 24.01 Credits. Because Puter aggregates differently priced text and image tokens in that row, units alone cannot reconstruct the split exactly; subtracting a prompt contribution leaves an image-input cost in the same order of magnitude as the patch proxy. This is useful validation of scale, not enough evidence to derive a new proprietary formula. Keep the proxy labelled and let the app-scoped before/after measurement supersede it for repeated settings.
