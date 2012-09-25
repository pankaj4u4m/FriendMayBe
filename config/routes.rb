MetlyDevise::Application.routes.draw do

  devise_for :users, :controllers => {:omniauth_callbacks => "users/omniauth_callbacks"}, :skip => [:sessions, :passwords, :registrations] do
    get 'sign_in', :to => 'users/sessions#new', :as => :new_user_session
    get 'sign_out', :to => 'users/sessions#destroy', :as => :destroy_user_session
  end

  authenticated :user do
    root to: "home_pages#home"
    post "/login", to: "home_pages#login"
    post "/location" , to: "home_pages#location"
    post "/notification", to: "home_pages#notification"
    get "/feedback", to: "home_pages#feedback"
  end
  root to: "login_pages#login"
  match "/help", to: "login_pages#help"
  match "/contact", to: "login_pages#contact"
  get "/feedback", to: "login_pages#feedback"
  get "/privacy", to: "login_pages#privacy"

  get "/anonymous", to: "anonymous#anonymous"
  post "/anonymouslogin", to: "anonymous#anonymouslogin"
  post "/location" , to: "anonymous#location"
  post "/notification", to: "anonymous#notification"

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'

  #match '*path', :to => 'application#routing_error'

end
