/**
 * @module @sard-cms/docker-runtime/config
 * Docker configuration types
 */

export interface DockerConfig {
  name: string;
  tag: string;
  ports: number[];
  resources: {
    cpu: number;
    memory: string;
  };
  env: Record<string, string>;
}

