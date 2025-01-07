// eslint-disable-next-line import/no-extraneous-dependencies
import { ComponentType } from 'react';
import Home from './routes/home/home';

interface RouteConfig {
  path: string;
  Component: ComponentType;
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    Component: Home,
  },
];
