import urllib.request

url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1MDI0MTg4MmZhMDQwNWQzM2Y3NjlkM2JkOGEwEgsSBxDIqpr3oBAYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDIzODIzOTU5Mzg5MzA2NjM2Nw&filename=&opi=89354086'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read()
    with open('downloaded_infographic.html', 'wb') as f:
        f.write(html)
    print("Downloaded successfully.")
except Exception as e:
    print(f"Error: {e}")
