#include <pebble.h>
#include "config.h"


static TextLayer *info_layer;
// Info Layer Params
static const uint32_t info_layer_padding = 4;
static const GColor info_txt_color = GColorBlack;
static const GTextAlignment info_alignment = GTextAlignmentCenter;
static const GFont info_font = FONT_KEY_GOTHIC_24;

static GRect get_info_layer_bounds(Layer *window_layer){
  GRect bounds = layer_get_frame(window_layer);
  uint32_t width = bounds.size.w - (info_layer_padding * 2);
  return GRect(info_layer_padding, 50, width , 2000);
}

static void set_info_layer(void){
  text_layer_set_text_color(info_layer, info_txt_color);
  text_layer_set_background_color(info_layer, bg_color); // We set it by default to the window bg color to hide it
  text_layer_set_text_alignment(info_layer, info_alignment);
  text_layer_set_font(info_layer, fonts_get_system_font(info_font));
}

void create_info_layer(Layer *window_layer){
  GRect bounds = get_info_layer_bounds(window_layer);
  info_layer = text_layer_create(bounds);
  set_info_layer();
  layer_add_child(window_layer, text_layer_get_layer(info_layer));
}

void destroy_info_layer(void){
  text_layer_destroy(info_layer);
}

void set_info_text(char text[]){
  text_layer_set_text(info_layer, text);
  GSize max_size = text_layer_get_content_size(info_layer);
  max_size.w = max_size.w + 5;
  max_size.h = max_size.h + 5;
  text_layer_set_size(info_layer, max_size);
  text_layer_set_background_color(info_layer, GColorWhite);
}