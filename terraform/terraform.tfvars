# terraform.tfvars
# Here we set the actual values for the variables defined in variables.tf
subscription_id     = "e28a91e8-0909-4a14-9f2d-45db5b903a50"
resource_group_name = "hvp-aks"
location            = "eastus"
cluster_name        = "freelance-aks"
dns_prefix          = "freelance-aks-dns"
kubernetes_version  = "1.31.10"
node_resource_group = "MC_hvp-aks_freelance-aks_eastus" # Updated region

