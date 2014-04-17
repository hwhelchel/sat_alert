#pragma once


void create_info_layer(Layer* window_layer);
void destroy_info_layer();
void set_info_text(char text[]);
extern TextLayer *info_layer;