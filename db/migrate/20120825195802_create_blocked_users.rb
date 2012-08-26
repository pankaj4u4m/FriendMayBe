class CreateBlockedUsers < ActiveRecord::Migration
  def change
    create_table :blocked_users  do |t|
      t.integer :blocker_id, :limit => 8
      t.integer :blocked_id, :limit => 8
      t.string :reason

      t.timestamps
    end
    add_index :blocked_users, :blocker_id
    add_index :blocked_users, :blocked_id
  end
end
