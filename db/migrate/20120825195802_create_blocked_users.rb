class CreateBlockedUsers < ActiveRecord::Migration
  def change
    create_table :blocked_users do |t|
      t.integer :blocker_id
      t.integer :blocked_id
      t.string :reason

      t.timestamps
    end
    add_index :blocked_users, :blocker_id
    add_index :blocked_users, :blocked_id
  end
end
