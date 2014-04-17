#include <pebble.h>
#include "../window/info_layer.h"
#include "../config.h"

AppTimer *timer;
char text[140];

static void set_text(DictionaryIterator *iter){
  Tuplet value = TupletInteger(0, 0); // For now we don't care about the message we send.
  dict_write_tuplet(iter, &value);
}
static void prepare_message(void) {
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  set_text(iter);
}

static void ask_for_iss_location(void *data) {
  prepare_message();
  app_message_outbox_send();

	// reset timer to relaunch the polling
  timer = app_timer_register(polling_frequency, ask_for_iss_location, NULL); 
}

static void set_text_from_dict_tuple(DictionaryIterator *dict, uint16_t index){
	Tuple *tuple = dict_find(dict, index);
  strncpy(text, tuple->value->cstring, 140);
}

static void handle_in_received(DictionaryIterator *sent, void *context){
  set_text_from_dict_tuple(sent, 0);
  set_info_text(text);
  vibes_double_pulse();
}

void register_message_callbacks(void){
  app_message_register_inbox_received(handle_in_received);
}

void message_handler_init(void){
  register_message_callbacks();
  app_message_open(inbound_size, outbound_size);
  ask_for_iss_location(NULL);
}