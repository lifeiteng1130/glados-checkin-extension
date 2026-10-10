const DEFAULT={enabled:true,mode:'fixed',fixedTime:'09:00',randomStart:'08:00',randomEnd:'10:00',retryMinutes:120};
const timeOk=(v)=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const minute=(v)=>{const [h,m]=v.split(':').map(Number);return h*60+m};
const asTime=(v)=>`${String(Math.floor(v/60)).padStart(2,'0')}:${String(v%60).padStart(2,'0')}`;
export const normalizeScheduleConfig=(v={})=>({...DEFAULT,...v,retryMinutes:Number(v.retryMinutes??DEFAULT.retryMinutes)});
export function validateScheduleConfig(v){const c=normalizeScheduleConfig(v);if(!['fixed','random'].includes(c.mode))throw Error('签到模式无效。');if(!timeOk(c.fixedTime)||!timeOk(c.randomStart)||!timeOk(c.randomEnd))throw Error('时间格式必须为 HH:mm。');if(!Number.isInteger(c.retryMinutes)||c.retryMinutes<1)throw Error('重试间隔必须是正整数分钟。');if(c.mode==='random'&&minute(c.randomEnd)<=minute(c.randomStart))throw Error('随机范围结束时间必须晚于开始时间，且不能跨夜。');return c}
export function chooseDailyTime(c,rng=Math.random){if(c.mode==='fixed')return c.fixedTime;const a=minute(c.randomStart),b=minute(c.randomEnd),r=Math.min(Math.max(rng(),0),.999999999);return asTime(a+Math.floor(r*(b-a+1)))}
export function localDateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function timeOnDate(day,time){const [y,m,d]=day.split('-').map(Number),[h,min]=time.split(':').map(Number);return new Date(y,m-1,d,h,min)}
export const nextLocalDayStart=(d=new Date())=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,0,5);
export function classifyCheckinResponse({httpOk,status,body}){const message=typeof body?.message==='string'?body.message.trim():'';if(httpOk&&Number(body?.code)===0)return{ok:true,kind:'success',message:message||'签到成功。'};if(httpOk&&/already|repeat|tomorrow|已签到|重复签到|明天再试/i.test(message))return{ok:true,kind:'already',message:message||'今日已签到。'};if(status===401||status===403||/unauthori[sz]ed|login|cookie|session|登录|会话/i.test(message))return{ok:false,kind:'auth',message:'登录已失效，请重新登录 GLaDOS。'};return{ok:false,kind:'failure',message:message||`签到接口返回异常（HTTP ${status||'未知'}）。`}}
