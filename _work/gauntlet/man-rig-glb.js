const fs=require('fs');
function readGLB(file){
  const b=fs.readFileSync(file); let off=12,json=null,bin=null;
  while(off<b.length){const cl=b.readUInt32LE(off),ct=b.readUInt32LE(off+4);
    if(ct===0x4E4F534A) json=JSON.parse(b.slice(off+8,off+8+cl).toString('utf8'));
    else if(ct===0x004E4942) bin=b.slice(off+8,off+8+cl);
    off+=8+cl;}
  return {json,bin};
}
const CT={5120:[Int8Array,1],5121:[Uint8Array,1],5122:[Int16Array,2],5123:[Uint16Array,2],5125:[Uint32Array,4],5126:[Float32Array,4]};
const NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function accessor(g,bin,i){
  const a=g.accessors[i], [TA,bs]=CT[a.componentType], n=NC[a.type];
  const bv=g.bufferViews[a.bufferView];
  const base=(bv.byteOffset||0)+(a.byteOffset||0);
  const stride=bv.byteStride||0;
  if(!stride||stride===n*bs){
    const out=new TA(a.count*n);
    const src=new TA(bin.buffer,bin.byteOffset+base,a.count*n);
    out.set(src); return out;
  }
  const out=new TA(a.count*n);
  for(let k=0;k<a.count;k++){ const s=new TA(bin.buffer,bin.byteOffset+base+k*stride,n); out.set(s,k*n); }
  return out;
}
module.exports={readGLB,accessor,CT,NC};
