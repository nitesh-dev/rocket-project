
// import './style.css'
// import * as PIXI from 'pixi.js'

/* How to use

1) setup(spaceImageUrl, rocketImageUrl, blastImageUrls, flameImageUrls)
  this function is used to setup canvas. it will do all image loading task.

2) restart(endTime)
  this function reset the ship to start position

3) startRocket()
  this function will make your rocket to move

4) destroyRocket()
  this function will destroy the ship

Note: you have to call setup() only once,
      use restart() to reset the ship


*/ 



const canvasContainer = document.querySelector('#canvas-container')

const app = new PIXI.Application({
  antialias: true,
  width: canvasContainer.clientWidth,
  height: canvasContainer.clientHeight,
  backgroundAlpha: 0
});

app.view.style.backgroundColor = "transparent"

canvasContainer.appendChild(app.view);


let duration = 10
let time = 0

let backgroundHeight = 0
const offset = 60
const start = new PIXI.Point(offset, app.screen.bottom - offset)
const control = new PIXI.Point(app.screen.right - offset, app.screen.bottom - offset)
const end = new PIXI.Point(app.screen.right - offset, offset)

let rocket= null
let blast = null
let flame = null
let isRocketMoving = false
let background = null
let trail = null

// const rocketAnimation = 1
// const rocketAnimationMaxDis = 30



let rocketImage = ''
let blastImages = Array()
let flameImages = Array()

async function setup(spaceImageUrl, rocketImageUrl, blastImagesUrl, flameImagesUrl) {

  background = await createBackground(spaceImageUrl)
  rocketImage = rocketImageUrl
  blastImages = blastImagesUrl
  flameImages = flameImagesUrl

  trail = trailContainer()
  app.stage.addChild(trail);
  restart(10)
}



async function restart(animationDuration) {

  // remove previous blast object if found
  if(blast != null){
    app.stage.removeChild(blast)
  }

  duration = animationDuration
  time = 0
  isRocketMoving = false
  rocket = await createRocket(rocketImage)
  app.stage.addChild(rocket)

  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

}

function startRocket() {
  isRocketMoving = true
}


async function createRocket(image) {
  const container = new PIXI.Container();

  flame = await rocketFlame(0.25)

  const gameObject = PIXI.Sprite.from(image)
  gameObject.scale.x = 0.15
  gameObject.scale.y = 0.15

  // center the sprite's anchor point
  gameObject.anchor.set(0.5)
  container.addChild(flame)
  container.addChild(gameObject)

  return container
}

async function destroyRocket() {
  if (rocket == null) return
  blast = await createBlast()
  blast.x = rocket.x
  blast.y = rocket.y
  app.stage.addChild(blast)

  // remove rocket
  app.stage.removeChild(rocket)
  rocket = null
}

async function createBlast() {
  const scale = 0.3
  const textures = Array();

  for (const url of blastImages) {
    const texture = await PIXI.Assets.load(url)
    textures.push(texture)
  }


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


function drawRocketTail(width, color, alpha) {

  const graphics = new PIXI.Graphics();

  graphics.lineStyle(width, color, alpha);

  graphics.moveTo(start.x, start.y);

  graphics.quadraticCurveTo(control.x, control.y, end.x, end.y);

  return graphics

}


async function createBackground(image) {

  const container = new PIXI.Container();
  const texture = await PIXI.Assets.load(image)
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
  container.addChild(drawRocketTail(15, 0xf3e300, 0.15))
  container.addChild(drawRocketTail(2, 0xf3e300, 1))
  return container
}


async function rocketFlame(scale) {
  const textures = Array();

  for (const url of flameImages) {
    const texture = await PIXI.Assets.load(url)
    textures.push(texture)
  }

  // flameImages.forEach(url => {
  //   textures.push(PIXI.Texture.from(url))
  // });


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
function main(delta) {
  if (rocket == null || isRocketMoving == false) {

    // update train mask
    if(trail != null){
      trail.mask = new PIXI.Graphics()
      .beginFill(0x000000)
      .drawRect(offset, offset, 0, app.screen.bottom)
      .endFill();
    }
  }

  delta = delta / 60

  // animate the rocket if it is ideal
  if (rocket != null && isRocketMoving == false) {

  }

  if (isRocketMoving == false || rocket == null) return

  time += delta
  if (time > duration) time = duration

  // move background if rocket reach the limit

  if (background != null) {
    background.y += 100 * delta
    if (background.y > 0) {
      background.y = -backgroundHeight / 2
    }
  }

  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

  // update train mask
  if(trail != null){
    trail.mask = new PIXI.Graphics()
    .beginFill(0x000000)
    .drawRect(offset, rocket.y - 15, rocket.x - rocket.width / 4, app.screen.bottom)
    .endFill();
  }
}


function easingFunction(progress) {
  return Math.sin(progress * Math.PI * 2);
}

function getCurvePoint(t) {
  const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
  const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
  return { x: x, y: y }
}


// map the value between 0 to 1
function mapToOne(value, max) {
  return value / max
}


function tangentToDegree(t) {
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
