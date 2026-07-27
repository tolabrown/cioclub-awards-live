param(
    [string]$FilePath,
    [string]$OutputPath
)

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($FilePath)
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }

if ($null -eq $entry) {
    Write-Error "Could not find word/document.xml in docx archive."
    exit 1
}

$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlText = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

# Parse XML to extract paragraphs and headings
[xml]$xmlDoc = $xmlText

$nsManager = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
$nsManager.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xmlDoc.SelectNodes("//w:p", $nsManager)

$outputLines = @()
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $nsManager)
    $pText = ""
    foreach ($t in $texts) {
        $pText += $t.InnerText
    }
    if ($pText.Trim().Length -gt 0) {
        $outputLines += $pText
    }
}

if ($OutputPath) {
    $outputLines | Set-Content -Path $OutputPath -Encoding UTF8
    Write-Host "Extracted $($outputLines.Count) non-empty paragraphs to $OutputPath"
} else {
    Write-Host "Total non-empty paragraphs: $($outputLines.Count)"
    $previewCount = [Math]::Min(20, $outputLines.Count)
    Write-Host "--- Preview (First $previewCount lines) ---"
    for ($i = 0; $i -lt $previewCount; $i++) {
        Write-Host $outputLines[$i]
    }
}
