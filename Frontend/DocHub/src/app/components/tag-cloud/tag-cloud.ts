import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
    OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Bubble {
  label: string;
  count: number;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-tag-cloud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag-cloud.html',
  styleUrls: ['./tag-cloud.scss']
})
export class TagCloudComponent implements AfterViewInit, OnDestroy, OnChanges {
  private viewReady = false;

  @Input() tags: { tag: string; count: number }[] = [];
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  bubbles: Bubble[] = [];
  animationId!: number;

  width = 0;
  height = 0;

  mouse = { x: -9999, y: -9999 };

  // Visual buffer for borders + shadows
  readonly BUFFER = 6;

 ngAfterViewInit() {
  this.viewReady = true;

  if (this.tags.length > 0) {
    this.initialize();
    this.animate();
  }
}
ngOnChanges(changes: SimpleChanges) {
  if (!changes['tags'] || !this.viewReady) return;
  if (!this.tags.length) return;

  cancelAnimationFrame(this.animationId);

  this.initialize();
  this.animate();
}

  initialize() {
    const rect = this.container.nativeElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    const max = Math.max(...this.tags.map(t => t.count));

    this.bubbles = this.tags.slice(0, 10).map(tag => {
      const radius = 22 + (tag.count / max) * 18;

      return {
        label: tag.tag,
        count: tag.count,
        radius,
        x: Math.random() * (this.width - radius * 2) + radius,
        y: Math.random() * (this.height - radius * 2) + radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      };
    });
  }

  animate = () => {
    this.updatePhysics();
    this.animationId = requestAnimationFrame(this.animate);
  };

  updatePhysics() {
    const friction = 0.99;
    const driftStrength = 0.02;

    for (let i = 0; i < this.bubbles.length; i++) {
      const a = this.bubbles[i];

      /* 🌊 Idle drift (always active) */
      a.vx += (Math.random() - 0.5) * driftStrength;
      a.vy += (Math.random() - 0.5) * driftStrength;

      /* Move */
      a.x += a.vx;
      a.y += a.vy;

      /* Wall bounce (pre-check) */
      if (
        a.x - a.radius <= this.BUFFER ||
        a.x + a.radius >= this.width - this.BUFFER
      ) {
        a.vx *= -1;
      }

      if (
        a.y - a.radius <= this.BUFFER ||
        a.y + a.radius >= this.height - this.BUFFER
      ) {
        a.vy *= -1;
      }

      /* Hard clamp (NO LEAKS EVER) */
      a.x = Math.max(
        a.radius + this.BUFFER,
        Math.min(this.width - a.radius - this.BUFFER, a.x)
      );

      a.y = Math.max(
        a.radius + this.BUFFER,
        Math.min(this.height - a.radius - this.BUFFER, a.y)
      );

      /* Bubble–bubble collision */
      for (let j = i + 1; j < this.bubbles.length; j++) {
        const b = this.bubbles[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius + 4;

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;

          // Soft velocity exchange
          const tempVx = a.vx;
          const tempVy = a.vy;
          a.vx = b.vx * 0.9;
          a.vy = b.vy * 0.9;
          b.vx = tempVx * 0.9;
          b.vy = tempVy * 0.9;
        }
      }

      /* Mouse repulsion (optional enhancement) */
      const mx = a.x - this.mouse.x;
      const my = a.y - this.mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < 100) {
        a.vx += mx * 0.0006;
        a.vy += my * 0.0006;
      }

      /* Friction */
      a.vx *= friction;
      a.vy *= friction;

      /* Remove sub-pixel drift */
      a.x = Math.round(a.x);
      a.y = Math.round(a.y);
    }
  }

  onMouseMove(e: MouseEvent) {
    const rect = this.container.nativeElement.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  onMouseLeave() {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
  }
}
