class CreateLoginHistories < ActiveRecord::Migration
  def change
    create_table :login_histories do |t|
      t.integer :user_id
      t.integer :location_id
      t.timestamp :login_time
      t.string :logout_time
      t.string :timestamp

      t.timestamps
    end
  end
end
