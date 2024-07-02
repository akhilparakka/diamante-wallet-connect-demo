# React App: Wallet Connection and Asset Minting

## Overview

This React application is a demo showcasing how to connect to a Chrome extension wallet using window.diam, and mint an asset on the Diamante Testnet. The app allows users to connect their wallet, upload an image, specify a name, and mint a new asset.

## Table of Contents

- Installation
- Usage
- Features
- Dependencies

## Installation

1. Clone the repository

```bash
git clone https://github.com/akhilparakka/diamante-wallet-connect-demo
```

2. Navigate to the project directory:

```bash
cd diamante-wallet-connect-demo
```

3. Install the dependencies

```bash
yarn
```

## Usage

1. Start the application

```bash
yarn dev
```

2. Open the browser and navigate to

```
 http://localhost:5173/
```

3. Connect your wallet.

4. Upload an image and specify a name.

5. Mint the asset.

## Features

- Wallet Connection: Connects to a Chrome extension wallet using window.diam.
- Image Upload: Allows users to upload an image file.
- Asset Minting: Mints a new asset on the Diamante Testnet.
- Progress and Error Handling: Displays progress messages and handles errors.

## Dependencies

- diamante-sdk-js: SDK for interacting with the Diamante blockchain.
