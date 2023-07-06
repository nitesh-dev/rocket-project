
import './style.css'
import * as PIXI from 'pixi.js'


const canvasContainer = document.querySelector('#canvas-container') as HTMLDivElement

const app = new PIXI.Application({
  antialias: true,
  width: canvasContainer.clientWidth,
  height: canvasContainer.clientHeight,
  backgroundAlpha: 0
});

(app.view as HTMLCanvasElement).style.backgroundColor = "transparent"

canvasContainer.appendChild(app.view as any);


// temp data
const duration = 10
let time = 0

const offset = 40

const start = new PIXI.Point(offset, app.screen.bottom - offset)
const control = new PIXI.Point(app.screen.right - offset, app.screen.bottom - offset)
const end = new PIXI.Point(app.screen.right - offset, offset)

let rocket: PIXI.Container<PIXI.DisplayObject> | null = createRocket()
let blast: PIXI.AnimatedSprite | null = null



function createRocket() {
  const container = new PIXI.Container();

  const flame = rocketFlame(0.1)

  const gameObject = PIXI.Sprite.from('./rocket.png')
  gameObject.scale.x = 0.15
  gameObject.scale.y = 0.15

  // center the sprite's anchor point
  gameObject.anchor.set(0.5)
  container.addChild(flame)
  container.addChild(gameObject)

  return container
}

function destroyRocket(){
  if(rocket == null) return
  blast = createBlast()
  blast.x = rocket.x
  blast.y = rocket.y
  app.stage.addChild(blast)

  // remove rocket
  app.stage.removeChild(rocket)
  rocket = null
}

function createBlast(){
  const scale = 0.3
  const textures = Array<PIXI.Texture<PIXI.Resource>>();
  textures.push(PIXI.Texture.from('./blast/blast1.png'))
  textures.push(PIXI.Texture.from('./blast/blast2.png'))
  textures.push(PIXI.Texture.from('./blast/blast3.png'))
  textures.push(PIXI.Texture.from('./blast/blast4.png'))

  const animatedSprite = new PIXI.AnimatedSprite(textures)

  // Set animation properties
  animatedSprite.animationSpeed = 0.1;
  animatedSprite.loop = false;

  animatedSprite.anchor.set(0.5)
  // Start the animation
  animatedSprite.play();

  // Optionally, you can position and scale the sprite
  // animatedSprite.position.set(x, y); // Set the desired position
  animatedSprite.scale.set(scale, scale);

  return animatedSprite
}




function drawRocketTail(width: number, color: number, alpha: number) {

  const graphics = new PIXI.Graphics();

  graphics.lineStyle(width, color, alpha);

  graphics.moveTo(start.x, start.y);

  graphics.quadraticCurveTo(control.x, control.y, end.x, end.y);

  return graphics

}

const trail = trailContainer()

function trailContainer() {
  const container = new PIXI.Container();
  container.addChild(drawRocketTail(15, 0xf3e300, 0.2))
  container.addChild(drawRocketTail(2, 0xf3e300, 1))
  return container
}


function rocketFlame(scale: number) {
  const textures = Array<PIXI.Texture<PIXI.Resource>>();
  textures.push(PIXI.Texture.from('./flame1.png'))
  textures.push(PIXI.Texture.from('./flame2.png'))
  textures.push(PIXI.Texture.from('./flame3.png'))

  const animatedSprite = new PIXI.AnimatedSprite(textures)

  // Set animation properties
  animatedSprite.animationSpeed = 0.1;
  animatedSprite.loop = true;

  animatedSprite.anchor.set(1.4, 0.45)
  // Start the animation
  animatedSprite.play();

  // Optionally, you can position and scale the sprite
  // animatedSprite.position.set(x, y); // Set the desired position
  animatedSprite.scale.set(scale, scale);


  return animatedSprite
}


setTimeout(destroyRocket, 9000)

// update every frame
function main(delta: number) {
  if(rocket == null) return

  delta = delta / 60               // to second

  time += delta
  if (time > duration) time = duration

  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

  // update train mask
  trail.mask = new PIXI.Graphics()
    .beginFill(0x000000)
    .drawRect(offset, rocket.y - 15, rocket.x - rocket.width / 3, app.screen.bottom)
    .endFill();
}


function getCurvePoint(t: number) {
  const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
  const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
  return { x: x, y: y }
}


// map the value between 0 to 1
function mapToOne(value: number, max: number) {
  return value / max
}


function tangentToDegree(t: number) {
  const tangent = new PIXI.Point();

  // Calculate the direction vector at t
  tangent.x = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x);
  tangent.y = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);

  // Calculate the angle in radians
  const angleRadians = Math.atan2(tangent.y, tangent.x);

  // Convert the angle to degrees
  const angleDegrees = angleRadians * (180 / Math.PI);

  return angleDegrees;
}



// Listen for animate update
app.ticker.add(main);
app.stage.addChild(trail);
app.stage.addChild(rocket)
