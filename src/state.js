import {create} from 'zustand';
export const useGame=create(set=>({
  screen:'menu',ready:false,run:0,near:null,reading:null,found:false,
  start:()=>set(s=>({screen:'play',reading:null,near:null,found:false,run:s.run+1})),
  inspect:()=>set(s=>s.screen==='play'&&s.near?{screen:'reading',reading:s.near,found:s.found||s.near.id==='forge'}:{}),
  show:screen=>set({screen}), setNear:near=>set({near})
}));
