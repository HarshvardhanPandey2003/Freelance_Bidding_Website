# variables.tf
# This acts as a documentation for anyone using your configuration by not reveling sensitive information
# It helps in validation and type checking
variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "resource_group_name" {
  description = "Resource group for AKS cluster"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "cluster_name" {
  description = "AKS cluster name"
  type        = string
}

variable "dns_prefix" {
  description = "DNS prefix for AKS cluster"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
}

variable "node_resource_group" {
  description = "Node resource group name"
  type        = string
}
