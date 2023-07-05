
import './style.css'
import * as PIXI from 'pixi.js'


const canvasContainer = document.querySelector('#canvas-container') as HTMLDivElement

const app = new PIXI.Application({
  antialias: true,
  width: canvasContainer.clientWidth,
  height: canvasContainer.clientHeight
});

canvasContainer.appendChild(app.view as any);


// temp data
const duration = 5
let time = 0

const offset = 40

const start = new PIXI.Point(offset, app.screen.bottom - offset)
const control = new PIXI.Point(app.screen.right - offset, app.screen.bottom - offset)
const end = new PIXI.Point(app.screen.right - offset, offset)

const rocket = createRocket()




function createRocket() {
  const container = new PIXI.Container();

  const flame = rocketFlame(0.1)

  const gameObject = PIXI.Sprite.from('./rocket.png')
  gameObject.scale.x = 0.3
  gameObject.scale.y = 0.3

  // center the sprite's anchor point
  gameObject.anchor.set(0.5)
  container.addChild(flame)
  container.addChild(gameObject)

  return container
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
  container.addChild(drawRocketTail(10, 0xf3e300, 0.2))
  container.addChild(drawRocketTail(2, 0xf3e300, 1))

  container.mask = new PIXI.Graphics()
    .beginFill(0x000000)
    .drawRect(offset, offset, rocket.x, app.screen.bottom)
    .endFill();
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


// update every frame
function main(delta: number) {
  delta = delta / 60               // to second

  time += delta
  if (time > duration) time = duration
  console.log(delta)

  rocket.angle = tangentToDegree(mapToOne(time))
  let pos = getCurvePoint(mapToOne(time))

  rocket.x = pos.x
  rocket.y = pos.y

  // update train mask
  trail.mask = new PIXI.Graphics()
    .beginFill(0x000000)
    .drawRect(offset, rocket.y, rocket.x - rocket.width / 3, app.screen.bottom)
    .endFill();
}


function getCurvePoint(t: number) {
  const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
  const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
  return { x: x, y: y }
}


// map the value between 0 to 1
function mapToOne(value: number) {
  return value / 5
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