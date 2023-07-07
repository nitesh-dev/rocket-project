
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
const offset = 40
const start = new PIXI.Point(offset, app.screen.bottom - offset)
const control = new PIXI.Point(app.screen.right - offset, app.screen.bottom - offset)
const end = new PIXI.Point(app.screen.right - offset, offset)

let rocket: PIXI.Container<PIXI.DisplayObject> | null = null
let blast: PIXI.AnimatedSprite | null = null
let flame: PIXI.AnimatedSprite | null = null

let background = await createBackground()


const trail = trailContainer()
app.stage.addChild(trail);

restart(2)
function restart(animationDuration: number) {
  duration = animationDuration
  time = 0
  rocket = createRocket()
  app.stage.addChild(rocket)

  // setTimeout(destroyRocket, 14000)
}


function createRocket() {
  const container = new PIXI.Container();

  flame = rocketFlame(0.1)

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
  const texture = await PIXI.Assets.load('./space.png')
  const background1 = PIXI.Sprite.from(texture);
  const background2 = PIXI.Sprite.from(texture);

  container.addChild(background1);
  container.addChild(background2)
  background2.y = background1.height


  // calculating scale factor
  let scale = 1
  if(app.screen.width > app.screen.height){
    scale = app.screen.width / container.width
  }else{
    scale = app.screen.height / container.height
  }
  
  container.scale.set(scale)
  backgroundHeight = container.height
  app.stage.addChild(container)

  console.log(scale + "     " + container.width + '     ' + background1.height + "       " + backgroundHeight)

  return container
}

function trailContainer() {
  const container = new PIXI.Container();
  container.addChild(drawRocketTail(15, 0xf3e300, 0.2))
  container.addChild(drawRocketTail(4, 0xf3e300, 1))
  return container
}


function rocketFlame(scale: number) {
  const textures = Array<PIXI.Texture<PIXI.Resource>>();
  textures.push(PIXI.Texture.from('./flame/flame1.png'))
  textures.push(PIXI.Texture.from('./flame/flame2.png'))
  textures.push(PIXI.Texture.from('./flame/flame3.png'))

  const animatedSprite = new PIXI.AnimatedSprite(textures);
  animatedSprite.angle = 90

  // Set animation properties
  animatedSprite.animationSpeed = 0.1;
  animatedSprite.loop = false;

  animatedSprite.anchor.set(0.5, -0.2)
  // Start the animation
  animatedSprite.play();

  animatedSprite.scale.set(scale, scale);

  return animatedSprite
}


// update every frame
function main(delta: number) {
  if (rocket == null) {

    // update train mask
    trail.mask = new PIXI.Graphics()
      .beginFill(0x000000)
      .drawRect(offset, offset, 0, app.screen.bottom)
      .endFill();
    return
  }

  // console.log(background.y + "    " + backgroundHeight + "    " + background.width)

  delta = delta / 60

  time += delta
  if (time > duration) time = duration


  // move background if rocket reach the limit
  if (time == duration) {
    background.y += 20 * delta
    if (background.y > 0) {
      background.y = -backgroundHeight / 2
    }
    
  }



  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

  // change rocket flame
  flame?.gotoAndStop(getRocketFlameIndex(time))

  // update train mask
  trail.mask = new PIXI.Graphics()
    .beginFill(0x000000)
    .drawRect(offset, rocket.y - 15, rocket.x - rocket.width / 4, app.screen.bottom)
    .endFill();
}

function getRocketFlameIndex(timeElapsed: number) {
  const subTime = duration / 3              // because we have 3 frame for flame
  if (timeElapsed < subTime) {
    return 0
  } else if (timeElapsed < subTime * 2) {
    return 1
  } else {
    return 2
  }
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
