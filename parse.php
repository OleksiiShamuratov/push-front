<?php
$cc = json_decode(file_get_contents('https://subscribe.dev.justtrackme.website/countries'), true);
$map = "let country_codes = new Map([";
foreach ($cc as $value) {
    $map .= "['{$value['name']}',{$value['id']}],";
}
$map .= "])";
file_put_contents('cc.js', $map);