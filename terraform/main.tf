terraform {
  backend "remote" {
    organization = "dogehouse"

    workspaces {
      name = "auth"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

variable "container" {}
variable "deployurl" {}

resource "kubernetes_deployment" "auth" {
    metadata {
        name = "auth"
        namespace = "dogehouse"
        labels = {
            app = "auth"
        }
    }

    spec {
        replicas = 3
        
        selector {
            match_labels = {
                app = "auth"
            }
        }

        template {
            metadata {
                name = "auth"
                namespace = "dogehouse"
                labels = {
                    app = "auth"
                }
            }

            spec {
                container {
                    image = var.container
                    name = "auth"

                    env {
                        name = "FASTIFY_PRODUCTION"
                        value = "true"
                    }

                    env {
                        name = "GITHUB_CLIENT_SECRET"
                        value_from {
                            config_map_key_ref {
                                name = "config"
                                key = "GITHUB_CLIENT_SECRET"
                            }
                        }
                    }

                    env {
                        name = "GITHUB_CLIENT_ID"
                        value_from {
                            config_map_key_ref {
                                name = "config"
                                key = "GITHUB_CLIENT_ID"
                            }
                        }
                    }

                    env {
                        name = "AUTH_TOKEN"
                        value_from {
                            config_map_key_ref {
                                name = "config"
                                key = "AUTH_TOKEN"
                            }
                        }
                    }
                    env {
                        name = "POSTGRES_HOST"
                        value_from {
                            config_map_key_ref {
                                name = "config"
                                key = "POSTGRES_HOST"
                            }
                        }
                    }
                    env {
                        name = "POSTGRES_PASSWORD"
                        value_from {
                            config_map_key_ref {
                                name = "config"
                                key = "POSTGRES_PASSWORD"
                            }
                        }
                    }
                    env {
                        name = "GITHUB_REDIRECT_URI"
                        value_from {
                            config_map_key_ref {
                                name = "config"
                                key = "GITHUB_REDIRECT_URI"
                            }
                        }
                    }

                    port {
                        container_port = 3000
                    }

                    liveness_probe {
                        http_get {
                            path = "/"
                            port = 3000
                        }

                        initial_delay_seconds = 3
                        period_seconds        = 3
                    }
                }
                
                image_pull_secrets {
                    name = "regcred"
                }
            }
        }
    }
}

resource "kubernetes_service" "auth" {
    metadata {
        name = "auth"
        namespace = "dogehouse"
    }

    spec {
        selector = {
            app = kubernetes_pod.auth.metadata.0.labels.app
        }
        port {
            port = 3000
            target_port = 3000
        }
        type = "ClusterIP"
    }
}

resource "kubernetes_ingress" "auth" {
    metadata {
        name = "auth"
        namespace = "dogehouse"
        annotations = {
            "traefik.ingress.kubernetes.io/router.tls" = "true"
            "traefik.ingress.kubernetes.io/router.tls.certresolver" = "letsencrypt"
            "traefik.ingress.kubernetes.io/priority" = "4"
        }
    }

    spec {
        rule {
            host = var.deployurl
            http {
                path {
                    path = "/"
                    backend {
                        service_name = kubernetes_service.auth.metadata.0.name
                        service_port = 3000
                    }
                }
            }
        }
    }
}