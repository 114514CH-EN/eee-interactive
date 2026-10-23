#!/bin/bash
# usage: nup.sh <file_upload_id> <bearer_token> <local_file> [filename]
fn=${4:-$(basename "$3")}
curl -sS -X POST "https://api.notion.com/v1/mcp/file_uploads/$1/send" -H "authorization: Bearer $2" -F "file=@$3;filename=$fn" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('status'),d.get('filename'),d.get('markdown_source') or d)"
