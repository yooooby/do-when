// Personal images stay in this browser's IndexedDB. No network requests.
export const slots=['hero','청소','세탁','소모품','식물','기타','cheer'];
export async function validateImage(blob){
 if(!(blob instanceof Blob)||!blob.size||blob.size>5*1024*1024)throw Error('5MB 이하의 PNG, JPEG, WebP 이미지를 선택하세요.');
 const b=new Uint8Array(await blob.slice(0,12).arrayBuffer());
 const png=[137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v);
 const jpeg=b[0]===255&&b[1]===216&&b[2]===255;
 const webp=String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
 if(!png&&!jpeg&&!webp)throw Error('PNG, JPEG, WebP 이미지 파일만 사용할 수 있습니다.');
 return new Blob([blob],{type:png?'image/png':jpeg?'image/jpeg':'image/webp'});
}
function open(){return new Promise((resolve,reject)=>{const request=indexedDB.open('last-when-personal-images',1);request.onupgradeneeded=()=>request.result.createObjectStore('images',{keyPath:'slot'});request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('다른 앱 창을 닫은 뒤 다시 열어주세요.'));request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db)}})}
export async function readImages(){const db=await open();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const request=tx.objectStore('images').getAll();tx.oncomplete=()=>resolve(request.result);tx.onabort=()=>reject(tx.error||Error('이미지 읽기 실패'));tx.onerror=()=>{}})}finally{db.close()}}
export async function writeImage(slot,blob){if(!slots.includes(slot))throw Error('잘못된 이미지 위치입니다.');if(blob!==null)blob=await validateImage(blob);const db=await open();try{await new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');const store=tx.objectStore('images');if(blob===null)store.delete(slot);else store.put({slot,blob});tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('이미지 저장 실패'));tx.onerror=()=>{}})}finally{db.close()}}
