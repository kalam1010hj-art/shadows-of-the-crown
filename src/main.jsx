import React from 'react';
import {createRoot} from 'react-dom/client';
import Scene from './Scene';
import {useGame} from './state';
import styles from './game.module.css';
function Crown(){
  return <svg width="42" height="36" viewBox="0 0 44 36" fill="none" aria-hidden="true"><path d="m4 11 10 7 8-13 8 13 10-7-5 17H9zM10 32h24" stroke="currentColor" strokeWidth="1.6"/><path d="m22 15 3 5-3 4-3-4z" fill="currentColor"/></svg>;
}
function Guide(){
  return <dl>{[['Move','W A S D'],['Sprint','Shift + move'],['Jump','Space'],['Look around','Drag mouse'],['Zoom','Scroll wheel'],['Investigate','E'],['Pause / close','Esc']].map(([a,b])=><div key={a}><dt>{a}</dt><dd>{b}</dd></div>)}</dl>;
}
function App(){
  const {screen,show,start,ready,near,reading,inspect,found}=useGame();
  return <main className={styles.game}>
    <div className={styles.world}><Scene/></div>
    {screen==='menu'&&<section className={styles.menu}><div className={styles.brand}><Crown/><span>THE ELDERMOOR CHRONICLES</span></div>
      <div className={styles.hero}><div className={styles.kicker}>Chapter I <i/> The Silent Village</div>
      <h1>Shadows <em>of the</em><br/>Crown</h1>
      <p>The village bell has rung. The forge is still burning.<br/>Where is the blacksmith?</p>
      <button className={styles.primary} disabled={!ready} onClick={start}>{ready?'Enter Eldermoor':'Preparing Eldermoor…'} <b>⟶</b></button>
      <button className={styles.link} onClick={()=>show('controls')}>Controls</button></div>
      <footer>Eldermoor <i/> The Crownlands</footer></section>}
    {screen==='play'&&<><div className={styles.hud}><span className={styles.kicker}>{found?'Discovery recorded':'The Silent Village'}</span>
      <strong>{found?'A crown in the ash':'Find the blacksmith’s forge'}</strong>
      <small>{found?'Explore the rest of Eldermoor.':'Follow the market road. Look for the red coals on your right.'}</small></div>
      <button className={styles.pause} onClick={()=>show('pause')} aria-label="Pause game">Ⅱ</button>
      <div className={styles.bottom}>{near?<button className={styles.prompt} onClick={inspect}><kbd>E</kbd> {near.name}</button>:<span>WASD to move · Drag to look · Shift to sprint</span>}</div></>}
    {['reading','pause','controls'].includes(screen)&&<div className={styles.shade}><section className={styles.panel}>
      <Crown/><div className={styles.kicker}>{screen==='reading'?'Field notes':'Eldermoor'}</div>
      <h2>{screen==='reading'?reading.title:screen==='pause'?'Journey paused':'Controls'}</h2>
      {screen==='reading'?<p>{reading.text}</p>:<Guide/>}
      <button className={styles.primary} onClick={()=>show(screen==='controls'?'menu':'play')}>{screen==='controls'?'Main menu':screen==='reading'?'Close journal':'Resume journey'} <b>⟶</b></button>
      {screen==='pause'&&<button className={styles.link} onClick={()=>show('menu')}>Return to title</button>}
    </section></div>}
  </main>;
}
class GameBoundary extends React.Component{
  state={failed:false};static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className={styles.panel}><h2>Eldermoor could not open</h2><p>Use a desktop browser with WebGL 2 and hardware acceleration enabled.</p><button onClick={()=>location.reload()}>Try again</button></div>:this.props.children;}
}
createRoot(document.getElementById('root')).render(<GameBoundary><App/></GameBoundary>);
