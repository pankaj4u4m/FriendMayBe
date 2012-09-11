class CreateFeedbacks < ActiveRecord::Migration
  def change
    create_table :feedbacks do |t|
      t.integer :user_id, :limit => 8, :default => 0
      t.text :feedback

      t.timestamps
    end
  end
end
