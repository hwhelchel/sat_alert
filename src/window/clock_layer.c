#include <pebble.h>
#include "config.h"

static TextLayer *clock_layer;
static GTextAlignment clock_txt_alignment = GTextAlignmentCenter;
static GRect layer_bounds;
static Layer *window_layer;
static char time_text[] = "00:00:00";


// Makes time from seconds
static void handle_second_tick(struct tm* tick_time, TimeUnits units_changed) {
  strftime(time_text, sizeof(time_text), "%T", tick_time);
  text_layer_set_text(clock_layer, time_text);
}

// LAYER CREATION //
static void set_layer_bounds(){
  GRect bounds = layer_get_bounds(window_layer);
  layer_bounds = GRect(0, 10, bounds.size.w , 35);
}

static void set_layer_up(){
	set_layer_bounds();
  clock_layer = text_layer_create(layer_bounds);
  text_layer_set_text_alignment(clock_layer, clock_txt_alignment);
  text_layer_set_text_color(clock_layer, txt_color);
  text_layer_set_background_color(clock_layer, bg_color);
  text_layer_set_font(clock_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
}

static void set_time_management(){
	time_t now = time(NULL);
  struct tm *current_time = localtime(&now);
  handle_second_tick(current_time, SECOND_UNIT);
  tick_timer_service_subscribe(SECOND_UNIT, &handle_second_tick);
}

void create_clock_layer(Layer *input_layer){
	window_layer = input_layer;
	set_layer_up();
	set_time_management();
  layer_add_child(window_layer, text_layer_get_layer(clock_layer));
}

// LAYER DESTROY //
void destroy_clock_layer(void){
  text_layer_destroy(clock_layer);
}