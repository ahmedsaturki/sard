<?php
/**
 * Plugin Name: Yoast SEO
 * Description: The #1 WordPress SEO plugin.
 * Version: 22.5
 * Author: Team Yoast
 * License: GPLv3
 * Text Domain: wordpress-seo
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('WPSEO_Frontend')) {
    class WPSEO_Frontend {
        public function __construct() {
            add_action('wp_head', array($this, 'metadesc'), 1);
            add_action('wp_head', array($this, 'opengraph'), 5);
            add_action('wp_head', array($this, 'twitter'), 10);
            add_action('wp_head', array($this, 'json_ld'), 15);
        }
        
        public function metadesc() {
            if (is_singular()) {
                $desc = get_post_meta(get_the_ID(), '_yoast_wpseo_metadesc', true);
                if ($desc) {
                    echo '<meta name="description" content="' . esc_attr($desc) . '">' . PHP_EOL;
                }
            }
        }
        
        public function opengraph() {
            if (is_singular()) {
                $og_title = get_post_meta(get_the_ID(), '_yoast_wpseo_opengraph-title', true) ?: get_the_title();
                $og_desc = get_post_meta(get_the_ID(), '_yoast_wpseo_opengraph-description', true) ?: get_the_excerpt();
                $og_image = get_post_meta(get_the_ID(), '_yoast_wpseo_opengraph-image', true);
                
                echo '<meta property="og:title" content="' . esc_attr($og_title) . '">' . PHP_EOL;
                echo '<meta property="og:description" content="' . esc_attr($og_desc) . '">' . PHP_EOL;
                if ($og_image) {
                    echo '<meta property="og:image" content="' . esc_url($og_image) . '">' . PHP_EOL;
                }
                echo '<meta property="og:type" content="article">' . PHP_EOL;
                echo '<meta property="og:url" content="' . esc_url(get_permalink()) . '">' . PHP_EOL;
            }
        }
        
        public function twitter() {
            if (is_singular()) {
                echo '<meta name="twitter:card" content="summary_large_image">' . PHP_EOL;
                echo '<meta name="twitter:title" content="' . esc_attr(get_the_title()) . '">' . PHP_EOL;
            }
        }
        
        public function json_ld() {
            if (is_singular()) {
                $schema = array(
                    '@context' => 'https://schema.org',
                    '@type' => 'Article',
                    'headline' => get_the_title(),
                    'datePublished' => get_the_date('c'),
                    'dateModified' => get_the_modified_date('c'),
                    'author' => array(
                        '@type' => 'Person',
                        'name' => get_the_author_meta('display_name'),
                    ),
                    'publisher' => array(
                        '@type' => 'Organization',
                        'name' => get_bloginfo('name'),
                        'logo' => array(
                            '@type' => 'ImageObject',
                            'url' => get_site_icon_url(),
                        ),
                    ),
                );
                
                echo '<script type="application/ld+json">' . json_encode($schema) . '</script>' . PHP_EOL;
            }
        }
    }
    
    new WPSEO_Frontend();
}

if (!function_exists('wpseo_get_value')) {
    function wpseo_get_value($key, $default = '') {
        global $post;
        if ($post) {
            $value = get_post_meta($post->ID, '_yoast_wpseo_' . $key, true);
            return $value ?: $default;
        }
        return $default;
    }
}
