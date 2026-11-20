import {test,expect} from '@playwright/test';
test('enter the village, discover the forge and start a fresh run',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  const button=name=>page.getByRole('button',{name});
  await button('Controls').click();await expect(page.getByText('Investigate',{exact:true})).toBeVisible();
  await button('Main menu').click();await button('Enter Eldermoor').click();
  async function walkUntil(keys,prompt){
    for(const key of keys)await page.keyboard.down(key);
    try{await page.waitForFunction(text=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes(text)),prompt.source,{polling:'raf',timeout:45000});}
    finally{for(const key of keys)await page.keyboard.up(key);}
  }
  await walkUntil(['w'],/Read the waypost/);await page.keyboard.press('e');
  await expect(page.getByRole('heading',{name:'The market road'})).toBeVisible();await page.keyboard.press('Escape');
  await walkUntil(['w'],/Listen at the well/);
  await walkUntil(['w','d'],/Inspect the forge/);await page.keyboard.press('e');
  await expect(page.getByRole('heading',{name:'A crown in the ash'})).toBeVisible();
  await button('Close journal').click();await expect(page.getByText('Discovery recorded')).toBeVisible();
  await page.keyboard.press('Escape');await button('Return to title').click();await button('Enter Eldermoor').click();
  await expect(page.getByText('Find the blacksmith’s forge')).toBeVisible();expect(errors).toEqual([]);
});
