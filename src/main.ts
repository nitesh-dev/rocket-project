
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


let duration = 10
let time = 0

let backgroundHeight = 0
const offset = 60
const start = new PIXI.Point(offset, app.screen.bottom - offset)
const control = new PIXI.Point(app.screen.right - offset, app.screen.bottom - offset)
const end = new PIXI.Point(app.screen.right - offset, offset)

let rocket: PIXI.Container<PIXI.DisplayObject> | null = null
let blast: PIXI.AnimatedSprite | null = null
let flame: PIXI.AnimatedSprite | null = null
let isRocketMoving = false

const rocketAnimation = 1
const rocketAnimationMaxDis = 30

let background = await createBackground()


const trail = trailContainer()
app.stage.addChild(trail);

restart(5)

function restart(animationDuration: number) {
  duration = animationDuration
  time = 0
  isRocketMoving = false
  rocket = createRocket()
  app.stage.addChild(rocket)

  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

  setTimeout(startRocket, 2000)
  setTimeout(destroyRocket, 15000)
}

function startRocket(){
  isRocketMoving = true
}


setTimeout(() => {restart(5)}, 18000)


function createRocket() {
  const container = new PIXI.Container();

  flame = rocketFlame(0.25)

  const gameObject = PIXI.Sprite.from('./rocket.png')
  gameObject.scale.x = 0.15
  gameObject.scale.y = 0.15

  // center the sprite's anchor point
  gameObject.anchor.set(0.5)
  container.addChild(flame)
  container.addChild(gameObject)

  return container
}

function destroyRocket() {
  if (rocket == null) return
  blast = createBlast()
  blast.x = rocket.x
  blast.y = rocket.y
  app.stage.addChild(blast)

  // remove rocket
  app.stage.removeChild(rocket)
  rocket = null
}

function createBlast() {
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


async function createBackground() {
  const container = new PIXI.Container();
  const texture = await PIXI.Assets.load('./space.jpg')
  const background1 = PIXI.Sprite.from(texture);
  const background2 = PIXI.Sprite.from(texture);

  container.addChild(background1);
  container.addChild(background2)
  background2.y = background1.height


  // calculating scale factor
  let scale = 1
  if (app.screen.width > app.screen.height) {
    scale = app.screen.width / container.width
  } else {
    scale = app.screen.height / container.height
  }

  container.scale.set(scale)
  backgroundHeight = container.height
  app.stage.addChild(container)

  return container
}

function trailContainer() {
  const container = new PIXI.Container();
  container.addChild(drawRocketTail(15, 0xf3e300, 0.1))
  container.addChild(drawRocketTail(2, 0xf3e300, 1))
  return container
}


function rocketFlame(scale: number) {
  const textures = Array<PIXI.Texture<PIXI.Resource>>();
  textures.push(PIXI.Texture.from('./flame/flame1.png'))
  textures.push(PIXI.Texture.from('./flame/flame2.png'))
  textures.push(PIXI.Texture.from('./flame/flame3.png'))
  textures.push(PIXI.Texture.from('./flame/flame4.png'))
  textures.push(PIXI.Texture.from('./flame/flame5.png'))
  textures.push(PIXI.Texture.from('./flame/flame6.png'))
  textures.push(PIXI.Texture.from('./flame/flame7.png'))

  const animatedSprite = new PIXI.AnimatedSprite(textures);


  // Set animation properties
  animatedSprite.animationSpeed = 0.2;
  animatedSprite.loop = true;

  animatedSprite.anchor.set(1.35, 0.5)
  // Start the animation
  animatedSprite.play();

  animatedSprite.scale.set(scale, scale);

  return animatedSprite
}


// update every frame
function main(delta: number) {
  if (rocket == null || isRocketMoving == false) {

    // update train mask
    trail.mask = new PIXI.Graphics()
      .beginFill(0x000000)
      .drawRect(offset, offset, 0, app.screen.bottom)
      .endFill();
  }

  delta = delta / 60

  // animate the rocket if it is ideal
  if(rocket != null && isRocketMoving == false){

  }

  if (isRocketMoving == false || rocket == null) return

  time += delta
  if (time > duration) time = duration

  // move background if rocket reach the limit
  background.y += 100 * delta
  if (background.y > 0) {
    background.y = -backgroundHeight / 2
  }

  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

  // update train mask
  trail.mask = new PIXI.Graphics()
    .beginFill(0x000000)
    .drawRect(offset, rocket.y - 15, rocket.x - rocket.width / 4, app.screen.bottom)
    .endFill();
}


function easingFunction(progress: number) {
  return Math.sin(progress * Math.PI * 2);
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
