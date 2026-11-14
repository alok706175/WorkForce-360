# ----------------------------------------------------------------------------
# Maven Wrapper for PowerShell (WorkForce 360)
# ----------------------------------------------------------------------------

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WrapperJar = Join-Path $ScriptDir ".mvn\wrapper\maven-wrapper.jar"
$WrapperLauncher = "org.apache.maven.wrapper.MavenWrapperMain"

if (-not (Test-Path $WrapperJar)) {
    Write-Host "[INFO] Downloading Maven Wrapper Jar..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    (New-Object Net.WebClient).DownloadFile("https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar", $WrapperJar)
}

java "-Dmaven.multiModuleProjectDirectory=$ScriptDir" -cp $WrapperJar $WrapperLauncher $args

