ui = true

disable_mlock = true

storage "consul" {
    address = "192.168.49.167:30021"
    path = "/home/vault/data"
}

listener "tcp" {
    address = "0.0.0.0:8200"
    tls_disable = 1
}
