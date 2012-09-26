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

  create_table "ofBookmark", :primary_key => "bookmarkID", :force => true do |t|
    t.string  "bookmarkType",  :limit => 50, :null => false
    t.string  "bookmarkName",                :null => false
    t.string  "bookmarkValue",               :null => false
    t.integer "isGlobal",                    :null => false
  end

  create_table "ofBookmarkPerm", :id => false, :force => true do |t|
    t.integer "bookmarkID",   :limit => 8, :null => false
    t.integer "bookmarkType", :limit => 1, :null => false
    t.string  "name",                      :null => false
  end

  create_table "ofBookmarkProp", :id => false, :force => true do |t|
    t.integer "bookmarkID", :limit => 8,   :null => false
    t.string  "name",       :limit => 100, :null => false
    t.text    "propValue",                 :null => false
  end

  create_table "ofExtComponentConf", :primary_key => "subdomain", :force => true do |t|
    t.integer "wildcard",   :limit => 1,  :null => false
    t.string  "secret"
    t.string  "permission", :limit => 10, :null => false
  end

  create_table "ofGroup", :primary_key => "groupName", :force => true do |t|
    t.string "description"
  end

  create_table "ofGroupProp", :id => false, :force => true do |t|
    t.string "groupName", :limit => 50,  :null => false
    t.string "name",      :limit => 100, :null => false
    t.text   "propValue",                :null => false
  end

  create_table "ofGroupUser", :id => false, :force => true do |t|
    t.string  "groupName",     :limit => 50,  :null => false
    t.string  "username",      :limit => 100, :null => false
    t.integer "administrator", :limit => 1,   :null => false
  end

  create_table "ofID", :primary_key => "idType", :force => true do |t|
    t.integer "id", :limit => 8, :null => false
  end

  create_table "ofMucAffiliation", :id => false, :force => true do |t|
    t.integer "roomID",      :limit => 8, :null => false
    t.text    "jid",                      :null => false
    t.integer "affiliation", :limit => 1, :null => false
  end

  create_table "ofMucConversationLog", :id => false, :force => true do |t|
    t.integer "roomID",   :limit => 8,  :null => false
    t.text    "sender",                 :null => false
    t.string  "nickname"
    t.string  "logTime",  :limit => 15, :null => false
    t.string  "subject"
    t.text    "body"
  end

  add_index "ofMucConversationLog", ["logTime"], :name => "ofMucConversationLog_time_idx"

  create_table "ofMucMember", :id => false, :force => true do |t|
    t.integer "roomID",    :limit => 8,   :null => false
    t.text    "jid",                      :null => false
    t.string  "nickname"
    t.string  "firstName", :limit => 100
    t.string  "lastName",  :limit => 100
    t.string  "url",       :limit => 100
    t.string  "email",     :limit => 100
    t.string  "faqentry",  :limit => 100
  end

  create_table "ofMucRoom", :id => false, :force => true do |t|
    t.integer "serviceID",        :limit => 8,   :null => false
    t.integer "roomID",           :limit => 8,   :null => false
    t.string  "creationDate",     :limit => 15,  :null => false
    t.string  "modificationDate", :limit => 15,  :null => false
    t.string  "name",             :limit => 50,  :null => false
    t.string  "naturalName",                     :null => false
    t.string  "description"
    t.string  "lockedDate",       :limit => 15,  :null => false
    t.string  "emptyDate",        :limit => 15
    t.integer "canChangeSubject", :limit => 1,   :null => false
    t.integer "maxUsers",                        :null => false
    t.integer "publicRoom",       :limit => 1,   :null => false
    t.integer "moderated",        :limit => 1,   :null => false
    t.integer "membersOnly",      :limit => 1,   :null => false
    t.integer "canInvite",        :limit => 1,   :null => false
    t.string  "roomPassword",     :limit => 50
    t.integer "canDiscoverJID",   :limit => 1,   :null => false
    t.integer "logEnabled",       :limit => 1,   :null => false
    t.string  "subject",          :limit => 100
    t.integer "rolesToBroadcast", :limit => 1,   :null => false
    t.integer "useReservedNick",  :limit => 1,   :null => false
    t.integer "canChangeNick",    :limit => 1,   :null => false
    t.integer "canRegister",      :limit => 1,   :null => false
  end

  add_index "ofMucRoom", ["roomID"], :name => "ofMucRoom_roomid_idx"
  add_index "ofMucRoom", ["serviceID"], :name => "ofMucRoom_serviceid_idx"

  create_table "ofMucRoomProp", :id => false, :force => true do |t|
    t.integer "roomID",    :limit => 8,   :null => false
    t.string  "name",      :limit => 100, :null => false
    t.text    "propValue",                :null => false
  end

  create_table "ofMucService", :primary_key => "subdomain", :force => true do |t|
    t.integer "serviceID",   :limit => 8, :null => false
    t.string  "description"
    t.integer "isHidden",    :limit => 1, :null => false
  end

  add_index "ofMucService", ["serviceID"], :name => "ofMucService_serviceid_idx"

  create_table "ofMucServiceProp", :id => false, :force => true do |t|
    t.integer "serviceID", :limit => 8,   :null => false
    t.string  "name",      :limit => 100, :null => false
    t.text    "propValue",                :null => false
  end

  create_table "ofOffline", :id => false, :force => true do |t|
    t.string  "username",     :limit => 64, :null => false
    t.integer "messageID",    :limit => 8,  :null => false
    t.string  "creationDate", :limit => 15, :null => false
    t.integer "messageSize",                :null => false
    t.text    "stanza",                     :null => false
  end

  create_table "ofPresence", :primary_key => "username", :force => true do |t|
    t.text   "offlinePresence"
    t.string "offlineDate",     :limit => 15, :null => false
  end

  create_table "ofPrivacyList", :id => false, :force => true do |t|
    t.string  "username",  :limit => 64,  :null => false
    t.string  "name",      :limit => 100, :null => false
    t.integer "isDefault", :limit => 1,   :null => false
    t.text    "list",                     :null => false
  end

  add_index "ofPrivacyList", ["username", "isDefault"], :name => "ofPrivacyList_default_idx"

  create_table "ofPrivate", :id => false, :force => true do |t|
    t.string "username",    :limit => 64,  :null => false
    t.string "name",        :limit => 100, :null => false
    t.string "namespace",   :limit => 200, :null => false
    t.text   "privateData",                :null => false
  end

  create_table "ofProperty", :primary_key => "name", :force => true do |t|
    t.text "propValue", :null => false
  end

  create_table "ofPubsubAffiliation", :id => false, :force => true do |t|
    t.string "serviceID",   :limit => 100, :null => false
    t.string "nodeID",      :limit => 100, :null => false
    t.string "jid",                        :null => false
    t.string "affiliation", :limit => 10,  :null => false
  end

  create_table "ofPubsubDefaultConf", :id => false, :force => true do |t|
    t.string  "serviceID",           :limit => 100, :null => false
    t.integer "leaf",                :limit => 1,   :null => false
    t.integer "deliverPayloads",     :limit => 1,   :null => false
    t.integer "maxPayloadSize",                     :null => false
    t.integer "persistItems",        :limit => 1,   :null => false
    t.integer "maxItems",                           :null => false
    t.integer "notifyConfigChanges", :limit => 1,   :null => false
    t.integer "notifyDelete",        :limit => 1,   :null => false
    t.integer "notifyRetract",       :limit => 1,   :null => false
    t.integer "presenceBased",       :limit => 1,   :null => false
    t.integer "sendItemSubscribe",   :limit => 1,   :null => false
    t.string  "publisherModel",      :limit => 15,  :null => false
    t.integer "subscriptionEnabled", :limit => 1,   :null => false
    t.string  "accessModel",         :limit => 10,  :null => false
    t.string  "language"
    t.string  "replyPolicy",         :limit => 15
    t.string  "associationPolicy",   :limit => 15,  :null => false
    t.integer "maxLeafNodes",                       :null => false
  end

  create_table "ofPubsubItem", :id => false, :force => true do |t|
    t.string "serviceID",    :limit => 100,      :null => false
    t.string "nodeID",       :limit => 100,      :null => false
    t.string "id",           :limit => 100,      :null => false
    t.string "jid",                              :null => false
    t.string "creationDate", :limit => 15,       :null => false
    t.text   "payload",      :limit => 16777215
  end

  create_table "ofPubsubNode", :id => false, :force => true do |t|
    t.string  "serviceID",           :limit => 100, :null => false
    t.string  "nodeID",              :limit => 100, :null => false
    t.integer "leaf",                :limit => 1,   :null => false
    t.string  "creationDate",        :limit => 15,  :null => false
    t.string  "modificationDate",    :limit => 15,  :null => false
    t.string  "parent",              :limit => 100
    t.integer "deliverPayloads",     :limit => 1,   :null => false
    t.integer "maxPayloadSize"
    t.integer "persistItems",        :limit => 1
    t.integer "maxItems"
    t.integer "notifyConfigChanges", :limit => 1,   :null => false
    t.integer "notifyDelete",        :limit => 1,   :null => false
    t.integer "notifyRetract",       :limit => 1,   :null => false
    t.integer "presenceBased",       :limit => 1,   :null => false
    t.integer "sendItemSubscribe",   :limit => 1,   :null => false
    t.string  "publisherModel",      :limit => 15,  :null => false
    t.integer "subscriptionEnabled", :limit => 1,   :null => false
    t.integer "configSubscription",  :limit => 1,   :null => false
    t.string  "accessModel",         :limit => 10,  :null => false
    t.string  "payloadType",         :limit => 100
    t.string  "bodyXSLT",            :limit => 100
    t.string  "dataformXSLT",        :limit => 100
    t.string  "creator",                            :null => false
    t.string  "description"
    t.string  "language"
    t.string  "name",                :limit => 50
    t.string  "replyPolicy",         :limit => 15
    t.string  "associationPolicy",   :limit => 15
    t.integer "maxLeafNodes"
  end

  create_table "ofPubsubNodeGroups", :id => false, :force => true do |t|
    t.string "serviceID",   :limit => 100, :null => false
    t.string "nodeID",      :limit => 100, :null => false
    t.string "rosterGroup", :limit => 100, :null => false
  end

  add_index "ofPubsubNodeGroups", ["serviceID", "nodeID"], :name => "ofPubsubNodeGroups_idx"

  create_table "ofPubsubNodeJIDs", :id => false, :force => true do |t|
    t.string "serviceID",       :limit => 100, :null => false
    t.string "nodeID",          :limit => 100, :null => false
    t.string "jid",                            :null => false
    t.string "associationType", :limit => 20,  :null => false
  end

  create_table "ofPubsubSubscription", :id => false, :force => true do |t|
    t.string  "serviceID",         :limit => 100, :null => false
    t.string  "nodeID",            :limit => 100, :null => false
    t.string  "id",                :limit => 100, :null => false
    t.string  "jid",                              :null => false
    t.string  "owner",                            :null => false
    t.string  "state",             :limit => 15,  :null => false
    t.integer "deliver",           :limit => 1,   :null => false
    t.integer "digest",            :limit => 1,   :null => false
    t.integer "digest_frequency",                 :null => false
    t.string  "expire",            :limit => 15
    t.integer "includeBody",       :limit => 1,   :null => false
    t.string  "showValues",        :limit => 30
    t.string  "subscriptionType",  :limit => 10,  :null => false
    t.integer "subscriptionDepth", :limit => 1,   :null => false
    t.string  "keyword",           :limit => 200
  end

  create_table "ofRemoteServerConf", :primary_key => "xmppDomain", :force => true do |t|
    t.integer "remotePort"
    t.string  "permission", :limit => 10, :null => false
  end

  create_table "ofRoster", :primary_key => "rosterID", :force => true do |t|
    t.string  "username", :limit => 64,   :null => false
    t.string  "jid",      :limit => 1024, :null => false
    t.integer "sub",      :limit => 1,    :null => false
    t.integer "ask",      :limit => 1,    :null => false
    t.integer "recv",     :limit => 1,    :null => false
    t.string  "nick"
  end

  add_index "ofRoster", ["jid"], :name => "ofRoster_jid_idx", :length => {"jid"=>767}
  add_index "ofRoster", ["username"], :name => "ofRoster_unameid_idx"

  create_table "ofRosterGroups", :id => false, :force => true do |t|
    t.integer "rosterID",  :limit => 8, :null => false
    t.integer "rank",      :limit => 1, :null => false
    t.string  "groupName",              :null => false
  end

  add_index "ofRosterGroups", ["rosterID"], :name => "ofRosterGroup_rosterid_idx"

  create_table "ofSASLAuthorized", :id => false, :force => true do |t|
    t.string "username",  :limit => 64, :null => false
    t.text   "principal",               :null => false
  end

  create_table "ofSecurityAuditLog", :primary_key => "msgID", :force => true do |t|
    t.string  "username",   :limit => 64, :null => false
    t.integer "entryStamp", :limit => 8,  :null => false
    t.string  "summary",                  :null => false
    t.string  "node",                     :null => false
    t.text    "details"
  end

  add_index "ofSecurityAuditLog", ["entryStamp"], :name => "ofSecurityAuditLog_tstamp_idx"
  add_index "ofSecurityAuditLog", ["username"], :name => "ofSecurityAuditLog_uname_idx"

  create_table "ofSipPhoneLog", :id => false, :force => true do |t|
    t.string  "username"
    t.string  "addressFrom"
    t.string  "addressTo"
    t.integer "datetime",    :limit => 8
    t.integer "duration"
    t.string  "callType",    :limit => 20
  end

  create_table "ofSipUser", :primary_key => "username", :force => true do |t|
    t.string  "sipUsername"
    t.string  "sipAuthuser"
    t.string  "sipDisplayName"
    t.string  "sipPassword"
    t.string  "sipServer"
    t.string  "stunServer"
    t.string  "stunPort"
    t.integer "useStun"
    t.string  "voicemail"
    t.integer "enabled"
    t.string  "status"
    t.string  "outboundproxy"
    t.integer "promptCredentials"
  end

  add_index "ofSipUser", ["username"], :name => "username", :unique => true

  create_table "ofUser", :primary_key => "username", :force => true do |t|
    t.string "plainPassword",     :limit => 32
    t.string "encryptedPassword"
    t.string "name",              :limit => 100
    t.string "email",             :limit => 100
    t.string "creationDate",      :limit => 15,  :null => false
    t.string "modificationDate",  :limit => 15,  :null => false
  end

  add_index "ofUser", ["creationDate"], :name => "ofUser_cDate_idx"

  create_table "ofUserFlag", :id => false, :force => true do |t|
    t.string "username",  :limit => 64,  :null => false
    t.string "name",      :limit => 100, :null => false
    t.string "startTime", :limit => 15
    t.string "endTime",   :limit => 15
  end

  add_index "ofUserFlag", ["endTime"], :name => "ofUserFlag_eTime_idx"
  add_index "ofUserFlag", ["startTime"], :name => "ofUserFlag_sTime_idx"

  create_table "ofUserProp", :id => false, :force => true do |t|
    t.string "username",  :limit => 64,  :null => false
    t.string "name",      :limit => 100, :null => false
    t.text   "propValue",                :null => false
  end

  create_table "ofVCard", :primary_key => "username", :force => true do |t|
    t.text "vcard", :limit => 16777215, :null => false
  end

  create_table "ofVersion", :primary_key => "name", :force => true do |t|
    t.integer "version", :null => false
  end

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
