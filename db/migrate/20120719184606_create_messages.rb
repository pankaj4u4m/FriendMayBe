class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.integer :user_id_from
      t.integer :user_id_to
      t.datetime :message_time
      t.text :message

      t.timestamps
    end
    add_index :messages, :user_id_from
    add_index :messages, :user_id_to
  end
end
