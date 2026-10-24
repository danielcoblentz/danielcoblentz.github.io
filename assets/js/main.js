import { initBackground } from './background/index.js';
import { initDock } from './dock.js';
import { initScrollFade } from './scroll-fade.js';
import { initTabs } from './tabs.js';
import { initTimeline } from './timeline.js';
import { initTheme } from './theme.js';

initBackground();
initTabs();
initTimeline();
initTheme();
initScrollFade();
initDock();
