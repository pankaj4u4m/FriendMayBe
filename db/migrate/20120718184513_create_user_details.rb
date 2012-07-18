class CreateUserDetails < ActiveRecord::Migration
  def change
    create_table :user_details do |t|
      t.integer :user_id,         :null => false
      t.string :provider,         :null => false
      t.string :uid
      t.string :name
      t.string :birthday
      t.string :gender
      t.text :details

      t.timestamps
    end
    add_index :user_details, [:user_id, :provider],     :unique => true
  end

end
