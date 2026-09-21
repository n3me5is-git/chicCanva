// Run against a repository HTTP server on port 8765. Uses isolated browser storage.
const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const captureOnly=process.argv.includes('--capture-only');
  if(!captureOnly){
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  await page.goto('http://127.0.0.1:8765/tests/v7-test.html?v='+Date.now());
  await page.waitForSelector('#v7Results',{timeout:180000});
  const results=await page.textContent('#v7Results');
  console.log(results.split('\n').filter(line=>/Cloud|cloud|FAIL|ERROR|COMPLETE/.test(line)).join('\n'));
  if(!results.includes('ALL V7 CHECKS COMPLETE')||/FAIL|ERROR/.test(results))throw new Error(results);
  await page.close();
  }
  }
  if(process.argv.includes('--no-capture'))return;
  for(const lang of ['it','en']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}});
   await context.addInitScript(lang=>localStorage.setItem('chiccanva.language.v1',lang),lang);
   const view=await context.newPage();await view.goto('http://127.0.0.1:8765/chicCanva.html?v='+Date.now());
   await view.waitForFunction(()=>typeof document.getElementById('cloudLoginBtn')?.onclick==='function');
   await view.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.documentElement.style.setProperty('--sideW','560px');document.getElementById('cloudStorageCard').classList.remove('collapsed');});
   fs.writeFileSync(path.resolve('development/guide-assets/'+lang+'-cloud-panel.png'),await view.locator('#cloudStorageCard').screenshot());
   await view.evaluate(()=>document.getElementById('settingsDialog').showModal());
   fs.writeFileSync(path.resolve('development/guide-assets/'+lang+'-memory-dialog.png'),await view.locator('#settingsDialog').screenshot());
   await context.close();
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
