<?php
/**
 * Recibe el formulario PQR (avisos-legales.html) y envía la notificación
 * por correo a info@gobyfilters.com usando la función mail() nativa de PHP.
 *
 * Requiere que la cuenta info@gobyfilters.com exista en hPanel (Correos)
 * para que el hosting acepte enviar con ese remitente.
 */

header('Content-Type: application/json; charset=utf-8');

$destino = 'info@gobyfilters.com';

function respond(bool $success, string $message, array $extra = []): void {
    http_response_code($success ? 200 : 400);
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Método no permitido.');
}

function campo(string $nombre): string {
    return isset($_POST[$nombre]) ? trim((string) $_POST[$nombre]) : '';
}

$nombre   = campo('nombre');
$empresa  = campo('empresa');
$email    = campo('email');
$telefono = campo('telefono');
$tipo     = campo('tipo');
$asunto   = campo('asunto');
$autoriza = campo('autoriza_datos');

$tiposValidos = ['peticion', 'queja', 'reclamo', 'sugerencia'];

if ($nombre === '' || mb_strlen($nombre) > 150) {
    respond(false, 'El nombre es obligatorio.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'El correo electrónico no es válido.');
}
if (!in_array($tipo, $tiposValidos, true)) {
    respond(false, 'El tipo de solicitud no es válido.');
}
if (mb_strlen($asunto) < 30) {
    respond(false, 'La descripción debe tener al menos 30 caracteres.');
}
if ($autoriza === '') {
    respond(false, 'Debe autorizar el tratamiento de datos.');
}

$tiposLabel = [
    'peticion'   => 'Petición',
    'queja'      => 'Queja',
    'reclamo'    => 'Reclamo',
    'sugerencia' => 'Sugerencia',
];

$radicado = 'GOBY-' . date('Y') . '-' . str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

$asunto_correo = "Nueva PQR ({$tiposLabel[$tipo]}) — Radicado {$radicado}";

$cuerpo  = "Se ha recibido una nueva solicitud a través del formulario PQR del sitio web.\n\n";
$cuerpo .= "Radicado: {$radicado}\n";
$cuerpo .= "Tipo: {$tiposLabel[$tipo]}\n";
$cuerpo .= "Nombre: {$nombre}\n";
$cuerpo .= "Empresa: " . ($empresa !== '' ? $empresa : '—') . "\n";
$cuerpo .= "Correo: {$email}\n";
$cuerpo .= "Teléfono: " . ($telefono !== '' ? $telefono : '—') . "\n\n";
$cuerpo .= "Descripción:\n{$asunto}\n";

$headers  = "From: GOBY Filters Web <info@gobyfilters.com>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$enviado = mail($destino, $asunto_correo, $cuerpo, $headers);

if (!$enviado) {
    respond(false, 'No se pudo enviar el correo. Intente nuevamente más tarde.');
}

respond(true, 'Solicitud enviada correctamente.', ['radicado' => $radicado]);
