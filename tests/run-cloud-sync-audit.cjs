// NODE_PATH must include Playwright. Uses a fresh context and a fully simulated MEGA tree.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'chicCanva.html'),'utf8'),probe=fs.readFileSync(path.join(__dirname,'cloud-sync-audit.js'),'utf8');
 const anchor="init().catch(e=>{console.error(e);toast('Avvio incompleto: '+e.message)});";
 if(!html.includes(anchor))throw Error('Runtime test insertion point not found');
 const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
 try{
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
   const context=await browser.newContext({viewport});
   await context.route('**/*',route=>route.request().isNavigationRequest()?route.fulfill({contentType:'text/html',body:html.replace(anchor,()=>probe)}):route.abort());
   const page=await context.newPage();await page.goto('http://localhost:8765/cloud-sync-audit');
   await page.waitForFunction(()=>Array.isArray(window.cloudSyncAuditResults),{},{timeout:90000});
   const results=await page.evaluate(()=>window.cloudSyncAuditResults);
   await page.keyboard.press('Escape');
   results.push({name:'conflict dialog cannot be dismissed with Escape',passed:await page.locator('#cloudConflictDialog').evaluate(element=>element.open)});
   reports.push({viewport,results});console.log(viewport.width+'px: '+results.filter(item=>item.passed).length+'/'+results.length+' passed');
   for(const item of results)console.log((item.passed?'PASS ':'FAIL ')+item.name+(item.details?' — '+item.details:''));
   await context.close();
  }
 }finally{await browser.close()}
 fs.writeFileSync(path.join(__dirname,'cloud-sync-audit-results.json'),JSON.stringify(reports,null,2)+'\n');
 if(reports.some(report=>report.results.some(item=>!item.passed)))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
