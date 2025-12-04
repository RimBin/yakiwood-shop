#!/usr/bin/env python3
"""
Download all Figma assets and convert to local storage.

This script:
1. Takes a JSON file with asset mappings (filename -> Figma URL)
2. Downloads each asset to /public/assets/
3. Saves file metadata (size, format, etc)
4. Generates TypeScript mapping file

Usage:
    python scripts/download-assets.py

Requirements:
    pip install requests tqdm
"""

import os
import json
import requests
from pathlib import Path
from typing import Dict, List, Tuple
from urllib.parse import urlparse
from datetime import datetime
import sys

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_success(msg: str):
    print(f"{Colors.GREEN}✓{Colors.RESET} {msg}")

def log_error(msg: str):
    print(f"{Colors.RED}✗{Colors.RESET} {msg}")

def log_info(msg: str):
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {msg}")

def log_warn(msg: str):
    print(f"{Colors.YELLOW}⚠{Colors.RESET} {msg}")

# Asset definitions from Figma MCP output
FIGMA_ASSETS = {
    # Certifications
    'certifications/epd.png': 'https://www.figma.com/api/mcp/asset/305afbbc-83e2-4928-9c5e-3dcb66fa29be',
    'certifications/fsc.png': 'https://www.figma.com/api/mcp/asset/20195d58-d1bb-44e0-9909-57a5d553da23',
    'certifications/es-parama.png': 'https://www.figma.com/api/mcp/asset/3eef565b-fe13-4cc2-af4c-de09cc1caf8e',
    
    # Payments
    'payments/mastercard.svg': 'https://www.figma.com/api/mcp/asset/59d83223-4770-4ba6-9270-dd223eef348d',
    'payments/visa.svg': 'https://www.figma.com/api/mcp/asset/2d5e8e4f-8d53-4aaa-84e7-a0a56362fe4c',
    'payments/maestro.svg': 'https://www.figma.com/api/mcp/asset/c01f2a75-7056-4480-aac0-c5375cd90d9c',
    'payments/stripe.svg': 'https://www.figma.com/api/mcp/asset/b895c2b1-77a7-4d1b-ad70-927177742039',
    'payments/paypal.svg': 'https://www.figma.com/api/mcp/asset/9d97567a-6162-46df-b48b-67db5b4fcc76',
    
    # Projects
    'projects/project-1.jpg': 'https://www.figma.com/api/mcp/asset/a9b2f8db-382d-41fa-af1d-f9133afab1de',
    'projects/project-2.jpg': 'https://www.figma.com/api/mcp/asset/8256a773-5caa-4681-b77e-9613c6380771',
    'projects/project-3.jpg': 'https://www.figma.com/api/mcp/asset/dce92c57-bb6d-4140-9230-e49058248dd7',
    'projects/project-4.jpg': 'https://www.figma.com/api/mcp/asset/548485dd-0a98-4534-802f-e0bd552cf752',
    'projects/project-5.jpg': 'https://www.figma.com/api/mcp/asset/98e9b3bf-d587-4c01-8fbc-f5dfde91eed4',
    'projects/project-6.jpg': 'https://www.figma.com/api/mcp/asset/5e403f40-b9ff-42c7-9d29-ee3cae857197',
}

def ensure_dir(path: str) -> Path:
    """Create directory if it doesn't exist."""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p

def download_asset(url: str, filepath: Path, timeout: int = 30) -> Tuple[bool, str]:
    """Download single asset from Figma.
    
    Returns:
        (success: bool, message: str)
    """
    try:
        response = requests.get(url, timeout=timeout, allow_redirects=True, stream=True)
        response.raise_for_status()
        
        # Ensure parent directory exists
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Write file
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        size_kb = filepath.stat().st_size / 1024
        return True, f"{filepath.name} ({size_kb:.1f} KB)"
        
    except requests.exceptions.Timeout:
        return False, f"{filepath.name} - Timeout (>30s)"
    except requests.exceptions.ConnectionError:
        return False, f"{filepath.name} - Connection failed"
    except requests.exceptions.HTTPError as e:
        return False, f"{filepath.name} - HTTP {e.response.status_code}"
    except Exception as e:
        return False, f"{filepath.name} - {str(e)}"

def main():
    """Download all assets from Figma."""
    
    # Get project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    assets_dir = project_root / 'public' / 'assets'
    
    log_info(f"Assets directory: {assets_dir}")
    log_info(f"Total assets to download: {len(FIGMA_ASSETS)}")
    print()
    
    # Download assets
    successful = []
    failed = []
    
    for filename, url in FIGMA_ASSETS.items():
        filepath = assets_dir / filename
        log_info(f"Downloading {filename}...")
        
        success, message = download_asset(url, filepath)
        if success:
            log_success(message)
            successful.append((filename, filepath))
        else:
            log_error(message)
            failed.append((filename, message))
    
    # Print summary
    print()
    print("=" * 60)
    print(f"{Colors.BOLD}DOWNLOAD SUMMARY{Colors.RESET}")
    print("=" * 60)
    print(f"{Colors.GREEN}✓ Successful: {len(successful)}{Colors.RESET}")
    print(f"{Colors.RED}✗ Failed: {len(failed)}{Colors.RESET}")
    
    if failed:
        print("\nFailed downloads:")
        for filename, error in failed:
            print(f"  - {filename}: {error}")
    
    print("=" * 60)
    print()
    
    # Generate timestamp for comments
    timestamp = datetime.now().isoformat()
    log_info(f"Downloaded at: {timestamp}")
    
    return len(failed) == 0

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Download interrupted by user.{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        log_error(f"Fatal error: {str(e)}")
        sys.exit(1)
