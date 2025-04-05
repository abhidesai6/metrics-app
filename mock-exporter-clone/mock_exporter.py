from prometheus_client import start_http_server, Gauge, REGISTRY
import random
import time

# unregstering all the default process metrics so the scraped metrics will
# be only the one that's mocked below
for collector in list(REGISTRY._collector_to_names.keys()):
    REGISTRY.unregister(collector)

cpu_usage = Gauge("cpu_usage", "CPU usage")
memory_usage = Gauge("memory_usage", "Memory usage")

disk_usage = Gauge("disk_usage", "Disk space used (GB)")
disk_read_bytes = Gauge("disk_read_bytes", "Disk read bytes")
disk_write_bytes = Gauge("disk_write_bytes", "Disk write bytes")

network_rx_bytes = Gauge("network_rx_bytes", "Network received bytes")
network_tx_bytes = Gauge("network_tx_bytes", "Network transmitted bytes")

def generate_metrics():
    while True:
        cpu_usage.set(random.uniform(10, 90))
        memory_usage.set(random.uniform(2000, 16000))

        disk_usage.set(random.uniform(50, 500))
        disk_read_bytes.set(random.uniform(1e6, 1e9))
        disk_write_bytes.set(random.uniform(1e6, 1e9))

        network_rx_bytes.set(random.uniform(1e6, 1e9))
        network_tx_bytes.set(random.uniform(1e6, 1e9))

        time.sleep(2) 

if __name__ == "__main__":
    print('Starting exporter on port 9000')
    start_http_server(9000)
    generate_metrics()
