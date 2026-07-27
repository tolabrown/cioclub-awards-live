$word = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $docPath = 'C:\Users\TOLAN\Downloads\The_House_Was_Never_Quiet_Kindle_Ready_Clean_V2.docx'
    $doc = $word.Documents.Open($docPath)
    Write-Host "SUCCESS: Microsoft Word opened V2 flawlessly!"
    Write-Host "Paragraph count in Word: $($doc.Paragraphs.Count)"
    $doc.Close()
} catch {
    Write-Host "ERROR: $_"
} finally {
    if ($word -ne $null) {
        $word.Quit()
    }
}
