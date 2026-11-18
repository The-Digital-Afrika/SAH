<?php
/**
 * Plugin Name: Home & School Frontend Links
 * Description: Opens published post links on the configured Home & School frontend.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('admin_init', function () {
    register_setting('general', 'hs_frontend_url', array(
        'type' => 'string',
        'sanitize_callback' => function ($value) {
            $value = untrailingslashit(esc_url_raw(trim($value), array('https')));
            if ($value && (!wp_http_validate_url($value) || wp_parse_url($value, PHP_URL_QUERY) || wp_parse_url($value, PHP_URL_FRAGMENT))) {
                add_settings_error('hs_frontend_url', 'invalid_url', 'Enter a public HTTPS frontend URL without query parameters or fragments.');
                return get_option('hs_frontend_url', '');
            }
            return $value;
        },
        'default' => '',
    ));
    add_settings_field('hs_frontend_url', 'Home & School frontend URL', function () {
        echo '<input type="url" class="regular-text" name="hs_frontend_url" value="' . esc_attr(get_option('hs_frontend_url', '')) . '" placeholder="https://your-public-domain.example">';
        echo '<p class="description">Published posts open here. Leave empty to use WordPress links. Draft previews remain in WordPress.</p>';
    }, 'general');
});

function hs_public_frontend_post_url($post) {
    $base = get_option('hs_frontend_url', '');
    if (!$base || !$post instanceof WP_Post || 'post' !== $post->post_type || 'publish' !== $post->post_status || $post->post_password || !$post->post_name) {
        return '';
    }
    // Use the same category ordering as the REST API embedded terms.
    $terms = wp_get_object_terms($post->ID, 'category', array('orderby' => 'name', 'order' => 'ASC'));
    if (is_wp_error($terms)) {
        return '';
    }
    $category = $terms ? $terms[0]->slug : 'uncategorized';
    $aliases = array(
        'newspack-featured' => 'education',
        'partner' => 'parenting',
        'partner-2' => 'partners',
        'newspack-ask-dalena' => 'ask-dalena',
        'cooking-and-bonding' => 'cooking-bonding',
    );
    $section = isset($aliases[$category]) ? $aliases[$category] : $category;
    return untrailingslashit($base) . '/' . rawurlencode($section) . '/' . $post->post_name;
}

add_filter('post_link', function ($url, $post, $leavename) {
    if ($leavename) {
        return $url;
    }
    $frontend = hs_public_frontend_post_url($post);
    return $frontend ? $frontend : $url;
}, 10, 3);

add_filter('preview_post_link', function ($url, $post) {
    // Public frontend displays the saved, published version only.
    $frontend = hs_public_frontend_post_url($post);
    return $frontend ? $frontend : $url;
}, 10, 2);
