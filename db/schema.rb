# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120911025318) do

  create_table "blocked_users", :force => true do |t|
    t.integer  "blocker_id", :limit => 8
    t.integer  "blocked_id", :limit => 8
    t.string   "reason"
    t.datetime "created_at",              :null => false
    t.datetime "updated_at",              :null => false
  end

  add_index "blocked_users", ["blocked_id"], :name => "index_blocked_users_on_blocked_id"
  add_index "blocked_users", ["blocker_id"], :name => "index_blocked_users_on_blocker_id"

  create_table "feedbacks", :force => true do |t|
    t.integer  "user_id",    :limit => 8, :default => 0
    t.text     "feedback"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  create_table "login_locations", :force => true do |t|
    t.integer  "login_id",   :limit => 8
    t.spatial  "location",   :limit => {:type=>"point"}
    t.string   "resource"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  add_index "login_locations", ["location"], :name => "index_login_locations_on_location", :length => {"location"=>25}
  add_index "login_locations", ["login_id", "resource"], :name => "index_login_locations_on_login_id_and_resource"
  add_index "login_locations", ["login_id"], :name => "index_login_locations_on_login_id"

  create_table "message_archives", :force => true do |t|
    t.integer  "sender_id",   :limit => 8
    t.integer  "receiver_id", :limit => 8
    t.text     "body"
    t.datetime "created_at",               :null => false
    t.datetime "updated_at",               :null => false
  end

  add_index "message_archives", ["receiver_id"], :name => "index_message_archives_on_receiver_id"
  add_index "message_archives", ["sender_id"], :name => "index_message_archives_on_sender_id"

  create_table "stanza_archives", :force => true do |t|
    t.integer  "sender_id",   :limit => 8
    t.integer  "receiver_id", :limit => 8
    t.string   "stanza_type"
    t.text     "stanza"
    t.datetime "created_at",               :null => false
    t.datetime "updated_at",               :null => false
  end

  add_index "stanza_archives", ["sender_id"], :name => "index_stanza_archives_on_sender_id"

  create_table "user_connection_statuses", :force => true do |t|
    t.integer  "user_id",      :limit => 8
    t.string   "user_jid"
    t.integer  "stranger_id",  :limit => 8
    t.string   "stranger_jid"
    t.string   "user_status"
    t.datetime "created_at",                :null => false
    t.datetime "updated_at",                :null => false
  end

  add_index "user_connection_statuses", ["stranger_id"], :name => "index_user_connection_statuses_on_stranger_id"
  add_index "user_connection_statuses", ["stranger_jid"], :name => "index_user_connection_statuses_on_stranger_jid"
  add_index "user_connection_statuses", ["user_id"], :name => "index_user_connection_statuses_on_user_id"
  add_index "user_connection_statuses", ["user_jid"], :name => "index_user_connection_statuses_on_user_jid"

  create_table "user_details", :force => true do |t|
    t.integer  "user_id",    :limit => 8, :null => false
    t.string   "provider",                :null => false
    t.string   "uid"
    t.string   "name"
    t.string   "birthday"
    t.string   "gender"
    t.text     "details"
    t.datetime "created_at",              :null => false
    t.datetime "updated_at",              :null => false
  end

  add_index "user_details", ["user_id", "provider", "uid"], :name => "index_user_details_on_user_id_and_provider_and_uid", :unique => true

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "xmpp",                   :default => "", :null => false
    t.string   "name"
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true
  add_index "users", ["xmpp"], :name => "index_users_on_xmpp", :unique => true

end
