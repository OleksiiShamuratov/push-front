<?php
header('Content-type:application/json;charset=utf-8');
$content = json_decode(file_get_contents('php://input'), true);
if(
    !isset($content['category']['id']) || empty($content['category']['id'])
    || !isset($content['token']) || empty($content['token'])
    || !isset($content['traffic_source']['id']) || empty($content['traffic_source']['id'])
    || !isset($content['administrator']['id']) || empty($content['administrator']['id'])
    || !isset($content['country']['name']) || empty($content['country']['name'])
) {
print_r(json_encode([
    'status' => true,
    'entity' => [
        'id' => rand(1, 100000000000),
        'token' => $content['token'],
        'timezone' => $content['timezone']
    ]
]));
}
else {
    print_r(json_encode([
        'status' => false,
        'message'   => 'Empty body'
    ]));
}
die();