import{test,expect} from'@playwright/test';
import userData from './291_Users.json';
test('Verify Data Driven Test',async({})=>{
console.log(userData.username);
console.log(userData.password);
});