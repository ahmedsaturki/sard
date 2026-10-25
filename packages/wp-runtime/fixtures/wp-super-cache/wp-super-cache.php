<?php
/**
 * Plugin Name: WP Super Cache
 * Description: Very fast caching plugin for WordPress.
 * Version: 1.9.4
 * Author: Automattic
 * License: GPLv2
 * Text Domain: wp-super-cache
 */

if (!defined('ABSPATH')) { exit; }

define('WPCACHEHOME', WP_PLUGIN_DIR . '/wp-super-cache/');

function wpsc_init() {
    add_action('init', 'wpsc_cache_init');
    add_action('shutdown', 'wpsc_cache_action', 0);
    add_action('wp_cache_update', 'wpsc_cache_action', 10, 2);
}

function wpsc_cache_init() {
    if (defined('WP_CACHE') && WP_CACHE) {
        $cache_dir = get_option('wpsc_cache_dir', WP_CONTENT_DIR . '/cache/');
        if (!is_dir($cache_dir)) {
            wp_mkdir_p($cache_dir);
        }
    }
}

function wpsc_cache_action($post_id = 0) {
    if (!defined('WP_CACHE') || !WP_CACHE) return;
    
    $cache_dir = get_option('wpsc_cache_dir', WP_CONTENT_DIR . '/cache/');
    $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
    $cache_file = $cache_dir . 'supercache/' . md5($_SERVER['HTTP_HOST'] . $uri) . '/index.html';
    
    if (!is_file($cache_file) || (time() - filemtime($cache_file)) > 3600) {
        ob_start();
    }
}

function wpsc_serve_cache_file() {
    if (!defined('WP_CACHE') || !WP_CACHE) return false;
    
    $uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
    $cache_dir = get_option('wpsc_cache_dir', WP_CONTENT_DIR . '/cache/');
    $cache_file = $cache_dir . 'supercache/' . md5($_SERVER['HTTP_HOST'] . $uri) . '/index.html';
    
    if (is_file($cache_file) && (time() - filemtime($cache_file)) < 3600) {
        header('X-WP-Super-Cache: Served supercache file from PHP');
        readfile($cache_file);
        exit;
    }
    return false;
}

add_action('init', 'wpsc_serve_cache_file', 0);

add_action('admin_menu', function() {
    add_menu_page('WP Super Cache', 'WP Super Cache', 'manage_options', 'wpsupercache', 'wpsc_admin_page', 'dashicons-admin-network', 80);
});

function wpsc_admin_page() {
    echo '<div class="wrap"><h1>WP Super Cache</h1><p>Caching is ' . (defined('WP_CACHE') && WP_CACHE ? 'enabled' : 'disabled') . '.</p></div>';
}
