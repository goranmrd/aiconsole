#!/bin/bash

python_dir="./python"

check_installation() {
    if [ -d "$python_dir" ]; then
        echo "Python already installed."
    else
        download_python
    fi
    intall_dependencies
    echo "Build process completed!"
}

download_python() {
    echo "Detecting machine architecture..."
    arch_name="$(uname -m)"

    if [ "$arch_name" == "x86_64" ]; then
        echo "Detected Intel architecture."
        download_url="https://github.com/indygreg/python-build-standalone/releases/download/20210724/cpython-3.9.6-x86_64-apple-darwin-install_only-20210724T1424.tar.gz"
        file_name="cpython-3.9.6-x86_64-apple-darwin-install_only-20210724T1424.tar.gz"
    elif [ "$arch_name" == "arm64" ]; then
        echo "Detected Apple M1 architecture."
        # Update the download URL for the M1 architecture. Assuming here, but replace it if different
        download_url="https://github.com/indygreg/python-build-standalone/releases/download/20210724/cpython-3.9.6-aarch64-apple-darwin-install_only-20210724T1424.tar.gz"
        file_name="cpython-3.9.6-aarch64-apple-darwin-install_only-20210724T1424.tar.gz"
    else
        echo "Unknown architecture: $arch_name"
        exit 1
    fi

    echo "Downloading standalone Python for $arch_name..."
    curl -LO $download_url

    echo "Extracting Python..."
    tar -xzvf $file_name
    rm $file_name
}

intall_dependencies() {
    echo "Installing aiconsole and dependencies..."
    ./python/bin/pip install . --use-feature=in-tree-build
}

check_installation