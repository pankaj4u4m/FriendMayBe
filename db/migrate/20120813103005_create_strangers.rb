class CreateStrangers < ActiveRecord::Migration
  def change
    create_table :strangers do |t|
      t.string :user_id
      t.string :connection_status
      t.string :connected_user
      t.timestamp :updated_time

      t.timestamps
    end
    add_index :strangers, :user_id, unique: true
    add_index :strangers, [:user_id, :connection_status], unique: true
  end
end
