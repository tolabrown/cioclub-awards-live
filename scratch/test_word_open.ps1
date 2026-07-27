$word = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $docPath = 'C:\Users\TOLAN\Downloads\The_House_Was_Never_Quiet_Kindle_Ready.docx'
    $doc = $word.Documents.Open($docPath)
    Write-Host "SUCCESS: Microsoft Word opened the document flawlessly!"
    Write-Host "Paragraph count in Word: $($doc.Paragraphs.Count)"
    $doc.Close([ref]$false)
} catch {
    Write-Host "ERROR opening document in Word: $_"
} finally {
    if ($word -ne $null) {
        $word.Quit()
    }
}
