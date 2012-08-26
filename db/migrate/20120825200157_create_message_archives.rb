class CreateMessageArchives < ActiveRecord::Migration
  def change
    create_table :message_archives  do |t|
      t.integer :sender_id, :limit => 8
      t.integer :receiver_id, :limit => 8
      t.text :body

      t.timestamps
    end
    add_index :message_archives, :sender_id
    add_index :message_archives, :receiver_id
  end
end
