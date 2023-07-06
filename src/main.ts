
import './style.css'
import * as PIXI from 'pixi.js'


const canvasContainer = document.querySelector('#canvas-container') as HTMLDivElement

const app = new PIXI.Application({
  antialias: true,
  width: canvasContainer.clientWidth,
  height: canvasContainer.clientHeight
});

canvasContainer.appendChild(app.view as any);


const astroEjectDuration = 2

// temp data
const duration = 10
let time = 0

const offset = 40

const start = new PIXI.Point(offset, app.screen.bottom - offset)
const control = new PIXI.Point(app.screen.right - offset, app.screen.bottom - offset)
const end = new PIXI.Point(app.screen.right - offset, offset)

const rocket = createRocket()

let astroObjects = Array<AstroData>()




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



function createAstronaut() {
  const scale = 0.4
  const images = ['./astronauts/astronaut1.png', './astronauts/astronaut2.png', './astronauts/astronaut3.png', './astronauts/astronaut4.png', './astronauts/astronaut5.png', './astronauts/astronaut6.png']

  // select random image 
  const rand = Math.round(Math.random() * (images.length - 1))

  const astroObject = PIXI.Sprite.from(images[rand]);
  astroObject.anchor.set(0.5)
  astroObject.scale.x = scale
  astroObject.scale.y = scale

  astroObject.position.x = rocket.x
  astroObject.position.y = rocket.y

  const fireDirection = Math.round(Math.random() * 120) + 210

  let rotationSpeed = (Math.round(Math.random() * 360) - 180) * 2

  const astroData = new AstroData(astroEjectDuration, rotationSpeed, fireDirection, astroObject)
  astroObjects.push(astroData)

  app.stage.addChildAt(astroObject, app.stage.children.length - 1)

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


setInterval(createAstronaut, 200)

// update every frame
function main(delta: number) {
  delta = delta / 60               // to second

  time += delta
  if (time > duration) time = duration

  rocket.angle = tangentToDegree(mapToOne(time, duration))
  let pos = getCurvePoint(mapToOne(time, duration))

  rocket.x = pos.x
  rocket.y = pos.y

  // update ejected astronauts

  astroObjects.forEach(astro => {
    astro.update(delta)
  });

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





class AstroData {
  private timeLeft = 0
  private sprite: PIXI.Sprite | null = null
  private rotation = 360                            // rotation per second
  private fireDirection = 270
  private fireVelocity = 1

  constructor(duration: number, rotation: number, direction: number, sprite: PIXI.Sprite) {
    this.timeLeft = duration
    this.rotation = rotation
    this.sprite = sprite
    this.fireDirection = direction
  }

  update(deltaTime: number) {

    this.timeLeft -= deltaTime
    if (this.timeLeft < 0) {

      this.timeLeft = 0
      this.destroy()
    } else {

      this.updateAnimation(deltaTime)
    }
  }

  private updateAnimation(deltaTime: number) {
    if (this.sprite == null) return

    // changing rotation
    this.sprite.angle += this.rotation * deltaTime

    // moving sprite
    const angleInRadians = PIXI.DEG_TO_RAD * this.fireDirection;
    const velocityX = Math.cos(angleInRadians) * this.fireVelocity;
    const velocityY = Math.sin(angleInRadians) * this.fireVelocity;

    this.sprite.x += velocityX
    this.sprite.y -= velocityY

    // changing opacity
    this.sprite.alpha = this.timeLeft / astroEjectDuration
  }

  private destroy() {
    if (this.sprite == null) return
    app.stage.removeChild(this.sprite)
    astroObjects.splice(astroObjects.indexOf(this), 1)
  }
}